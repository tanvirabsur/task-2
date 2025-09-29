// ...existing code...
const fs = require('fs');
const csv = require("csv-parser");
const path = require("path");
const { execSync } = require("child_process");

const templatePath = path.join(__dirname, "templates");
const buildPath = path.join(__dirname, "build");
const csvPath = path.join(__dirname, "websites.csv");

if (!fs.existsSync(buildPath)) {
    fs.mkdirSync(buildPath);
}

function copyDirSync(src, dest, { exclude = [] } = {}) {
    if (!fs.existsSync(src)) throw new Error(`Source not found: ${src}`);
    fs.mkdirSync(dest, { recursive: true });
    for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
        // skip top-level excludes (like node_modules) and any matching names
        if (exclude.includes(entry.name)) continue;

        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);

        if (entry.isDirectory()) {
            copyDirSync(srcPath, destPath, { exclude });
            continue;
        }

        if (entry.isFile()) {
            try {
                fs.copyFileSync(srcPath, destPath);
            } catch (err) {
                // skip busy/locked files on Windows and warn
                if (err && (err.code === 'EBUSY' || err.code === 'EPERM' || err.code === 'EACCES')) {
                    console.warn(`Skipping busy/locked file: ${srcPath} -> ${err.code}`);
                    continue;
                }
                throw err;
            }
        }
    }
}

if (!fs.existsSync(csvPath)) {
    console.error("websites.csv not found at", csvPath);
    process.exit(1);
}

fs.createReadStream(csvPath)
    .pipe(csv())
    .on("data", (row) => {
        try {
            const domain = row.domain && String(row.domain).trim();
            const phone = row.phone && String(row.phone).trim();
            const address = row.address && String(row.address).trim();

            if (!domain) {
                console.warn("Skipping row without domain:", row);
                return;
            }

            const targetDir = path.join(buildPath, domain);

            // copy template into new folder but exclude node_modules to avoid locked binaries
            try {
                copyDirSync(templatePath, targetDir, { exclude: ['node_modules'] });
            } catch (err) {
                console.error("Failed to copy template:", err.message || err);
                return;
            }

            // If package.json exists in the copied template, run npm install to populate node_modules
            const pkgJsonPath = path.join(targetDir, 'package.json');
            if (fs.existsSync(pkgJsonPath)) {
                try {
                    console.log(`Running npm install for ${domain}...`);
                    execSync("npm install --no-audit --no-fund --silent", { cwd: targetDir, stdio: "inherit" });
                } catch (err) {
                    console.error("npm install failed for", domain, ":", err.message || err);
                    // continue — build will likely fail but proceed to show useful messages
                }
            } else {
                console.log(`No package.json in template for ${domain}, skipping npm install.`);
            }

            // Update Hero.jsx (replace first matching spin pattern)
            const heroPath = path.join(targetDir, `src/components/Hero.jsx`);
            if (fs.existsSync(heroPath)) {
                try {
                    let heroCode = fs.readFileSync(heroPath, 'utf8');
                    const options = ["Quick", "Fast", "Speedy"];
                    const randomWord = options[Math.floor(Math.random() * options.length)];
                    const replacedHeroCode = heroCode.replace(/\[\[\s*Quick\s*\|\s*Fast\s*\|\s*Speedy\s*\]\]/, randomWord);
                    fs.writeFileSync(heroPath, replacedHeroCode, 'utf8');
                } catch (err) {
                    console.warn("Failed to update Hero.jsx:", err.message || err);
                }
            } else {
                console.warn("Hero.jsx not found at", heroPath);
            }

            // Update Contact.jsx (ensure directory exists)
            const contactPath = path.join(targetDir, "src/components/Contact.jsx");
            try {
                fs.mkdirSync(path.dirname(contactPath), { recursive: true });
                const contactCode = `import React from "react";\n\nexport default function Contact() {\n return (<>\n <p>Phone: ${phone || ""}</p>\n <p>Address: ${address || ""}</p>\n </>);\n}`;
                fs.writeFileSync(contactPath, contactCode, 'utf8');
            } catch (err) {
                console.warn("Failed to write Contact.jsx for", domain, ":", err.message || err);
            }

            // npm build
            try {
                console.log(`Running npm run build for ${domain}...`);
                execSync("npm run build", { cwd: targetDir, stdio: "inherit" });
            } catch (err) {
                console.error("npm run build failed for", domain, ":", err.message || err);
            }
        } catch (err) {
            console.error("Error processing row:", err.stack || err.message || err);
        }
    })
    .on("error", (err) => {
        console.error("CSV read error:", err.message || err);
    });
// ...existing code...
const fs = require('fs');
const csv = require("csv-parser");
const path = require("path");
const { execSync } = require("child_process");


const templatePath = path.join(__dirname, "templates");
const buildPath = path.join(__dirname, "build");

if (!fs.existsSync(buildPath)) {
    fs.mkdirSync(buildPath);
}

fs.createReadStream("websites.cvs")
    .pipe(csv())
    .on("data", (row) => {
        const domain = row.domain;
        const phone = row.phone;
        const address = row.address;


        const targetDir = path.join(buildPath, domain);


        // template কপি করো নতুন ফোল্ডারে
        fs.cpSync(templatePath, targetDir, { recursive: true });


        // Contact.js ফাইল আপডেট করো
        const contactPath = path.join(targetDir, "src/Contact.js");
        let contactCode = `import React from "react";\n\nexport default function Contact() {\n return (<>\n <p>Phone: ${phone}</p>\n <p>Address: ${address}</p>\n </>);\n}`;


        fs.writeFileSync(contactPath, contactCode);


        // npm build করো
        execSync("npm run build", { cwd: targetDir, stdio: "inherit" });
    });

import React from 'react';

const Contact = () => {
    return (
       <section style={{ padding: '20px', borderTop: '1px solid #ccc', marginTop: '20px' }}>
      <h2>Contact Information</h2>
      
     
      <p>Phone: {phone}</p> 
      
      
      <p>Address: {address}</p>

    </section>
    );
};

export default Contact;
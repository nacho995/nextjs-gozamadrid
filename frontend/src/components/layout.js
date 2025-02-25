// src/components/layout.js
import React from 'react';
import ControlMenu from './header';
import Footer3 from './footer';

// Cambia la ruta si es necesario

const Layout = ({ children }) => (
  <>
   <ControlMenu className="z-50" />
    <main>{children}</main>
    <Footer3 />
  </>
);


export default Layout;

"use client";
import Image from "next/image";
import Link from "next/link";
import { FaXTwitter } from "react-icons/fa6";
import {
  BiLogoFacebookCircle,
  BiLogoInstagram,
  BiLogoLinkedinSquare,
  BiLogoYoutube,
} from "react-icons/bi";

export default function Footer3(props) {
  const footerData = {
    logo: {
      url: "/",
      src: "/logo.png",
      alt: "Goza Madrid Logo",
    },
    address: {
      label: "Dirección:",
      value: "Calle de Alcalá, 96, 28009 Madrid",
    },
    contact: {
      label: "Contacto:",
      phone: "+34 919 012 103",
      email: "marta@gozamadrid.com",
    },
    columnLinks: [
      {
        links: [
          { title: "Inicio", url: "/" },
          { title: "Propiedades", url: "/vender/comprar" },
          { title: "Servicios", url: "/servicios" },
          { title: "Reformas", url: "/reformas" },
          { title: "Blog", url: "/blog" },
        ],
      },
      {
        links: [
          { title: "eXp Realty", url: "/exp-realty" },
          { title: "Vender", url: "/vender" },
          { title: "Contacto", url: "/contacto" },
          { title: "Guía de Compra", url: "/servicios/residentes-espana/guia-compra" },
          { title: "Alquiler Turístico", url: "/servicios/residentes-espana/alquiler" },
        ],
      },
    ],
    socialMediaLinks: [
      { url: "https://facebook.com/gozamadrid", icon: <BiLogoFacebookCircle className="size-6" /> },
      { url: "https://instagram.com/gozamadrid", icon: <BiLogoInstagram className="size-6" /> },
      { url: "https://twitter.com/gozamadrid", icon: <FaXTwitter className="size-6 p-0.5" /> },
      { url: "https://linkedin.com/company/gozamadrid", icon: <BiLogoLinkedinSquare className="size-6" /> },
      { url: "https://youtube.com/@gozamadrid", icon: <BiLogoYoutube className="size-6" /> },
    ],
    footerText: "© 2024 Goza Madrid. Todos los derechos reservados.",
    footerLinks: [
      { title: "Política de Privacidad", url: "/privacidad" },
      { title: "Términos y Condiciones", url: "/terminos" },
      { title: "Aviso Legal", url: "/aviso-legal" },
    ],
  };

  return (
    <footer id="relume" className="px-[5%] py-12 md:py-18 lg:py-20 bg-gradient-to-r from-amarillo to-black text-white z-50 relative">
      <div className="container">
        <div className="grid grid-cols-1 gap-x-[4vw] gap-y-12 pb-12 md:gap-y-16 md:pb-18 lg:grid-cols-[1fr_0.5fr] lg:gap-y-4 lg:pb-20">
          <div>
            <div className="rb-6 mb-6 md:mb-8">
              <Link href={footerData.logo.url}>
                <Image
                  src={footerData.logo.src}
                  alt={footerData.logo.alt}
                  width={100}
                  height={40}
                  className="inline-block"
                />
              </Link>
            </div>
            <div className="rb-6 mb-6 md:mb-8">
              <div>
                <p className="mb-1 text-sm font-semibold">{footerData.address.label}</p>
                <p className="mb-5 text-sm md:mb-6">{footerData.address.value}</p>
              </div>
              <div>
                <p className="mb-1 text-sm font-semibold">{footerData.contact.label}</p>
                <p className="flex flex-col text-sm underline decoration-white underline-offset-1 md:mb-6">
                  <Link href={`tel:${footerData.contact.phone}`}>{footerData.contact.phone}</Link>
                  <Link href={`mailto:${footerData.contact.email}`}>{footerData.contact.email}</Link>
                </p>
              </div>
            </div>
            <div className="grid grid-flow-col grid-cols-[max-content] items-start justify-start gap-x-3">
              {footerData.socialMediaLinks.map((link, index) => (
                <Link key={index} href={link.url} target="_blank" rel="noopener noreferrer">
                  {link.icon}
                </Link>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 items-start gap-x-6 gap-y-10 md:grid-cols-2 md:gap-x-8 md:gap-y-4">
            {footerData.columnLinks.map((column, index) => (
              <ul key={index}>
                {column.links.map((link, linkIndex) => (
                  <li key={linkIndex} className="py-2 text-sm font-semibold">
                    <Link href={link.url}>{link.title}</Link>
                  </li>
                ))}
              </ul>
            ))}
          </div>
        </div>
        <div className="h-px w-full bg-white" />
        <div className="flex flex-col-reverse items-start justify-between pb-4 pt-6 text-sm md:flex-row md:items-center md:pb-0 md:pt-8">
          <p className="mt-8 md:mt-0">{footerData.footerText}</p>
          <ul className="grid grid-flow-row grid-cols-[max-content] justify-center gap-y-4 text-sm md:grid-flow-col md:gap-x-6 md:gap-y-0">
            {footerData.footerLinks.map((link, index) => (
              <li key={index} className="underline">
                <Link href={link.url}>{link.title}</Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}

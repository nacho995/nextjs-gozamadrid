"use client";

import "tailwindcss/tailwind.css";
import ExpRealty from "./eXpRealty";
import ExpCountries from "./expCountries";
import RegisterForm from "../FormContact";
import ExpRealtyMore from "./ExpRealty2";

export default function ExpPage() {
    return (
        <div className="m-0 p-0">
            <ExpRealty videoId="4NDjtS50SC4" title="Exp Realty" />
            <ExpCountries />
            <RegisterForm />
            <ExpRealtyMore videoId2="X-fZBk5sDGQ" videoId="PYFThiRO9v8" title="Exp Realty" />
        </div>
    );
}

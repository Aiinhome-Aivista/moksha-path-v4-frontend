import andriod from "../../assets/icon/andriod.svg";
import googlePay from "../../assets/icon/googlePay.svg";
import whatsapp from "../../assets/icon/whatsapp.svg";
import email from "../../assets/icon/message.svg";
import apple from "../../assets/icon/apple.svg";
import facebook from "../../assets/icon/facebook.svg";
import twitter from "../../assets/icon/twitter.svg";
import instagram from "../../assets/icon/instagram.svg";
import arattai from "../../assets/icon/arattai.svg";
import youtube from "../../assets/icon/youtube.svg";
import linkedin from "../../assets/icon/linkedin.svg";
import pinterest from "../../assets/icon/pinterest.svg";
import phonePe from "../../assets/icon/phonepe.svg";
import ruPay from "../../assets/icon/rupay.svg";
import paytm from "../../assets/icon/paytm.svg";
import visa from "../../assets/icon/visa.svg";
import Location from "../../assets/icon/location.svg";
import mastercard from "../../assets/icon/mastercard.svg";
export default function Footer() {
  return (
    <footer className="w-full">
      <div className="bg-[#FCEA0A] text-neutral-900 px-4 py-2 pl-10 pr-10">
        <div className="max-w-8xl mx-auto grid grid-cols-1 md:grid-cols-5 gap-2 pb-2">
          <div className="space-y-4">
            <div className="flex items-center gap-1 font-bold text-lg">
              <img src="/logogod.svg" alt="logo" className="w-10 h-10" />
              <div>
                <h3>
                  Moksh<span className="text-base text-[#E7842E]">Path</span>
                </h3>
                <p className="text-xs leading-none w-20 lg:w-full">
                  Guided Path to True Learning
                </p>
              </div>
            </div>
            <p className="text-sm leading-relaxed">
              <span className="font-semibold">EduPilot</span> bridges Indian
              education digital, courses, AI based customised plan, bullion
              merchants and gemstone suppliers with international & domestic
              buyers.
            </p>
          </div>
          <div className="text-sm space-y-2 justify-center flex flex-col gap-5">
            <div className="flex gap-1">
              <img src={whatsapp} alt="whatsapp" className="w-8 h-8" />
              <div>
                <p className="text-sm font-medium">For any support and assitance:</p>
                <p className="text-sm">(033)- 66666660 / 49494949</p>
              </div>
            </div>
             <div className="flex gap-1">
              <img src={Location} alt="whatsapp" className="w-8 h-8" />
              <div>
                <p className="text-sm font-medium">Your Location</p>
                <p className="text-sm">Kolkata 700056</p>
              </div>
            </div>
            <div className="flex gap-1">
              <img src={email} alt="email" className="w-8 h-8" />
              <div>
                <p className="text-sm font-medium">Write to us :</p>
                <p className="text-sm">mokshpath.org.com</p>
              </div>
            </div>
          </div>
          <div className="space-y-3 flex flex-col justify-center">
            <ul className="gap-4 md:gap-10 font-bold text-sm md:flex flex-col grid grid-cols-2">
              <li>Get registered</li>
              <li>Explore curriculum based plans</li>
              <li>Personal AI Tutor</li>
              <li>Videos</li>
            </ul>
          </div>
          <div className="space-y-3 flex flex-col">
            <ul className="gap-2 text-sm md:flex flex-col grid grid-cols-2">
              <li className="font-semibold text-white text-lg">Services</li>
              <li>Design Services</li>
              <li>Making Services</li>
              <li>After Sales Services</li>
              <li>Insurance</li>
              <li>Certifications</li>
              <li>Financing & Loan</li>
              <li>Securitization & Digitization</li>
            </ul>
          </div>
          <div className="space-y-3 flex flex-col justify-center">
            <ul className="gap-2 text-sm md:flex flex-col grid grid-cols-2">
              <li>Consultancy – Product</li>
              <li>Documentation & Administrative</li>
              <li>Logistics & Delivery</li>
              <li>Marketing & Promotion</li>
              <li>Software Services</li>
              <li>Storage & Vault Services</li>
              <li>Packing & Display Services</li>
            </ul>
          </div>
        </div>
        <div className="-ml-20 -mr-10 border-t border-neutral-800/30 pt-2"></div>
        <div className="max-w-full flex justify-between flex-col md:flex-row items-center">
          <div>
            <h4 className="font-semibold mb-3">Download App</h4>
            <div className="flex gap-4">
              <img
                src={andriod}
                alt="Google Play Store"
                className="w-8 h-8 cursor-pointer"
              />
              <img
                src={apple}
                alt="Apple Store"
                className="w-8 h-8 cursor-pointer"
              />
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Visit us</h4>
            <div className="flex justify-center gap-3">
              {[
                facebook,
                twitter,
                instagram,
                arattai,
                youtube,
                linkedin,
                pinterest,
              ].map((icon, i) => (
                <div
                  key={i}
                  className="w-10 h-10 rounded-full  flex items-center justify-center cursor-pointer hover:scale-110 transition overflow-hidden"
                >
                  <img
                    src={icon}
                    alt="social"
                    className="w-8 h-8 object-contain text-[#D9D9D9]"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Payments */}
          <div>
            <h4 className="font-semibold mb-3 text-neutral-900">Payments</h4>
            <div className="flex flex-wrap items-center gap-4">
              <div className="cursor-pointer flex items-center gap-2 text-[15px] font-semibold text-gray-700">
                <img src={googlePay} alt="Google Pay" className="w-20 h-8" />
              </div>
              <div className="cursor-pointer flex items-center gap-2 text-[15px] font-semibold text-[#5f259f]">
                <img src={phonePe} alt="PhonePe" className="w-20 h-auto" />
              </div>
              <div className="cursor-pointer flex items-center gap-2 text-[15px] font-semibold text-[#0f2a44]">
                <img src={ruPay} alt="RuPay" className="w-10 h-auto" />
              </div>
              <div className="cursor-pointer flex items-center gap-2 text-[15px] font-semibold text-[#00baf2]">
                <img src={paytm} alt="Paytm" className="w-10 h-auto" />
              </div>
              <div className="cursor-pointer flex items-center gap-2 text-[15px] font-semibold text-[#00c2a8]">
                <span className="text-xl font-bold">S</span>
              </div>
              <div className="cursor-pointer flex items-center gap-2 text-[15px] font-semibold text-[#1a1f71]">
                <img src={visa} alt="Visa" className="w-10 h-auto" />
              </div>
              <div className="cursor-pointer flex items-center gap-2">
                <img
                  src={mastercard}
                  alt="Mastercard"
                  className="w-10 h-auto"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright Bar */}
      <div className="bg-neutral-700 text-neutral-300 items-start text-xs py-3 pl-10">
        Copyright © 2026 EduPilot. All Rights Reserved.
      </div>
    </footer>
  );
}

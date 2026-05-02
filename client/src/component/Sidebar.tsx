import React from "react";
import { Globe, ChevronDown, ChevronRight } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import pdf from "../assets/icons/pdf.svg";
import doc from "../assets/icons/document.svg";
import excel from "../assets/icons/excel.svg";
import jpeg from "../assets/icons/jpeg.svg";

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const domains = [
    "Environment, Health & Safety (EHS) Solution",
    "Managements Systems & Compliance",
    "Training & Competency Development",
    "Software & Digital Solution",
    "EGS and Sustainability Services",
    "Quality & Business Excellence",
  ];

  return (
    <aside className="w-[223px] hidden lg:flex flex-col gap-4 sticky top-20 h-fit">
      <div className="bg-[#262626] p-4 rounded-[20px] border border-[#333] shadow-xl">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-1.5">
            <Globe size={20} className="text-white" />
          </div>
          <h3 className="text-lg font-bold text-white tracking-tight">
            Domains
          </h3>
        </div>

        <div className="space-y-3">
          {domains.map((item, index) => (
            <button
              key={item}
              className="w-full text-left flex gap-2 group transition-all duration-300"
            >
              <span className="text-[#8BA2AD] font-medium text-xs mt-0.5">
                {index + 1}.
              </span>
              <span className="text-[#8BA2AD] group-hover:text-white text-xs font-medium leading-tight transition-colors">
                {item}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-[#262626] p-4 rounded-[20px] border border-[#333] shadow-xl">
        <div className="flex items-center justify-between mb-4 px-1">
          <h3 className="text-[14px] font-normal text-[#8BA2AD]">Resources</h3>
          <ChevronDown size={16} className="text-[#8BA2AD]" />
        </div>

        <div className="space-y-3">
          {[
            {
              name: "PDF",
              icon: <img src={pdf} alt="PDF" className="w-6 h-6" />,
              path: "/resources/pdf",
            },
            {
              name: "Documents",
              icon: <img src={doc} alt="Documents" className="w-6 h-6" />,
              path: "",
            },
            {
              name: "jpeg",
              icon: <img src={jpeg} alt="jpeg" className="w-6 h-6" />,
              path: "",
            },
            {
              name: "Excel",
              icon: <img src={excel} alt="Excel" className="w-6 h-6" />,
              path: "",
            },
          ].map((item) => (
            <button
              key={item.name}
              onClick={() => item.path && navigate(item.path)}
              className={`w-full flex items-center justify-between group py-0.5 transition-all ${
                item.path ? "hover:translate-x-1" : "cursor-default opacity-70"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="p-2">{item.icon}</div>
                <span
                  className={`font-medium text-md ${
                    item.path && location.pathname === item.path
                      ? "text-blue-400"
                      : "text-white"
                  }`}
                >
                  {item.name}
                </span>
              </div>
              <ChevronRight
                size={16}
                className="text-[#8BA2AD] group-hover:text-white transition-colors"
              />
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

"use client";
import React, { useEffect } from "react";

import MobileNav from "./layout/MobileNav";
import Navbar from "./layout/Navbar";
import Sidebar from "./layout/Sidebar";
import { usePathname, useRouter } from "next/navigation";
//@ts-ignore
import store from 'store';

const DefaultLayout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const router = useRouter();
  const token = store.get('accessToken');

  useEffect(() => {
    if(pathname.includes('/login')) {
        
    }
  },[])

  return (
    <>
      {pathname != "/login" ? (
        <div className="bg-gray-50 dark:bg-slate-900">
          <Navbar />
          <MobileNav />
          <Sidebar />
          <div className="w-full h-screen pt-10 px-4 sm:px-6 md:px-8 lg:ps-72">{children}</div>
        </div>
      ) : (
        children
      )}
    </>
  );
};

export default DefaultLayout;

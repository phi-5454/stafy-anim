import { useState } from "react";

import "./App.css";

import React from "react";

import { useEffect } from "react";
import PhysicsCanvas from "./PhysicsCanvas";

import {BrowserRouter, Link, Route, Router, Routes} from "react-router-dom";
import EinsteinSolid from "./EinsteinSolid.jsx";
import NLevelSystem from "./NLevelSystem.jsx";

function App() {
  const [menuVisible, setMenuVisible] = useState(false);

  const handleMenuVis = (event) => {
    setMenuVisible(event.target.checked);
  };


  return (
      //<div className="w-screen h-screen fixed top-0 left-0">
      <>
          <div className="w-full m-auto font-serif">
              <BrowserRouter
                  future={{
                      v7_startTransition: true,
                      v7_relativeSplatPath: true
                  }}
              >
              <div className="drawer">
                  <input id="my-drawer" checked={menuVisible} onChange={handleMenuVis} type="checkbox" className="drawer-toggle"/>
                  <div className="drawer-content">
                          <div className={menuVisible?"hidden":"fixed top-0 left-0 m-4 z-10"}>
                              <label htmlFor="my-drawer"
                                     className="btn border-0 hover:text-white rounded-sm btn-active text-black bg-amber-200 drawer-button">
                                  Menu
                      </label>
                          </div>
                      <div
                          className="flex flex-wrap sm:w-4/5 w-full m-0 justify-center p-0 sm:m-auto align-middle pb-5">
                              <Routes>
                                  <Route path="*" element={<EinsteinSolid/>}/>
                                  <Route path="/einsteinsolid" element={<EinsteinSolid/>}/>
                                  <Route path="/nlevelsystem" element={<NLevelSystem/>}/>
                              </Routes>
                      </div>
                  </div>
                  <div className="drawer-side z-20">
                      <label htmlFor="my-drawer" aria-label="close sidebar" className="drawer-overlay"></label>
                      <div className="bg-gradient-to-r from-black backdrop-blur h-full">
                          <ul className="menu text-base-content p-4">
                              <label htmlFor="my-drawer"
                                     className="btn border-0 rounded-sm  text-white drawer-button">Close</label>
                              <li>
                                  <nav>
                                      <ul>
                                          <li>
                                              <Link to="/einsteinsolid">Einstein solid</Link>
                                          </li>
                                          <li>
                                              <Link to="/nlevelsystem">N-level system</Link>
                                          </li>
                                      </ul>
                                  </nav>
                                  <a className={"rounded-none my-2"} href={"https://github.com/phi-5454/stafy-anim"}
                                     target="_blank">
                                      Source code
                                  </a>
                              </li>
                          </ul>
                      </div>
                  </div>
              </div>
          </BrowserRouter>
          </div>
      </>
  );
}

export default App;

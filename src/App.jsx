import { useState } from "react";

import "./App.css";

import React from "react";

import { useEffect } from "react";
import PhysicsCanvas from "./PhysicsCanvas";

import textBody from "./assets/contents.md";

import Markdown from "react-markdown";
import { Route, Routes } from "react-router-dom";

function App() {
  const [md_text, setMDtext] = useState("");
  const [menuVisible, setMenuVisible] = useState(false);

  const handleMenuVis = (event) => {
    setMenuVisible(event.target.checked);
  };

  useEffect(() => {
    // import the .md file from the assets folder
    import("./assets/contents.md")
      .then((res) => {
        fetch(res.default)
          .then((response) => response.text())
          .then((text) => setMDtext(text));
      })
      .catch((error) => console.error(error));
  }, []);

  return (
    //<div className="w-screen h-screen fixed top-0 left-0">
    <div className="w-full m-auto font-serif text-2xl bg-stone-900">
      <div className="drawer">
        <input
          id="my-drawer"
          checked={menuVisible}
          onChange={handleMenuVis}
          type="checkbox"
          className="drawer-toggle"
        />
        <div className="drawer-content">
          <div
            className={menuVisible ? "hidden" : "fixed top-0 left-0 m-4 z-10"}
          >
            <label
              htmlFor="my-drawer"
              className="btn border-0 hover:text-white rounded-sm btn-active text-black bg-amber-200 drawer-button"
            >
              Menu
            </label>
          </div>
          <div className="flex flex-wrap sm:w-4/5 w-full m-0 justify-center p-0 sm:m-auto align-middle pb-5">
            <PhysicsCanvas />
          </div>
          <div className="m-auto justify-center sm:w-3/5 w-5/6 py-5">
            <article>
              <Markdown className="prose prose-xl prose-invert font-serif m-auto">
                {md_text}
              </Markdown>
            </article>
          </div>
        </div>
        <div className="drawer-side z-20">
          <label
            htmlFor="my-drawer"
            aria-label="close sidebar"
            className="drawer-overlay"
          ></label>
          <div className="bg-gradient-to-r from-black backdrop-blur h-full">
            <ul className="menu text-base-content p-4">
              <label
                htmlFor="my-drawer"
                className="btn border-0 rounded-sm  text-white drawer-button"
              >
                Close
              </label>
              <li>
                <a
                  className={"rounded-none"}
                  href={"https://github.com/phi-5454/stafy-anim"}
                >
                  Source code
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;

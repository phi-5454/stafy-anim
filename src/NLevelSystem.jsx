import PhysicsCanvas from "./PhysicsCanvas.jsx";
import Markdown from "react-markdown";
import React, {useEffect, useState} from "react";
import PhysicsCanvasNLevel from "./assets/PhysicsCanvasNLevel.jsx";

const NLevelSystem = () => {

    const [md_text, setMDtext] = useState("");

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
        <>
        <PhysicsCanvasNLevel/>
            {
            /*
        <div className="m-auto justify-center sm:w-3/5 w-5/6 py-20">
            <Markdown
                className="prose prose-xl text-justify font-serif prose-invert m-auto">
                {md_text}
            </Markdown>
        </div>
        */}
        </>
);
}

export default NLevelSystem;
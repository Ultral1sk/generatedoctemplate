import React from "react";
import url from "./examples/image.png";
import PizZip from "pizzip";
import ImageModule from "docxtemplater-image-module";
import Docxtemplater from "docxtemplater";
import { saveAs } from "file-saver";
import PizZipUtils from "pizzip/utils/index.js";
import dtidata from "./dtidata.json";
import data from "./data.json";

const DTITComponent = () => {
  const generateDocx = () => {
    // target input to extract the uploaded file.
    const docs = document.getElementById("doc");

    // read it if there is any
    const reader = new FileReader();
    if (docs.files.length === 0) {
      alert("No files selected");
    }

    reader.readAsBinaryString(docs.files.item(0));

    reader.onload = function (evt) {
      const content = evt.target.result;
      const docxType =
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
      const opts = {};
      opts.centered = false;
      opts.getImage = function (tagValue, tagName) {
        return new Promise(function (resolve, reject) {
          PizZipUtils.getBinaryContent(tagValue, function (error, content) {
            if (error) {
              return reject(error);
            }
            return resolve(content);
          });
        });
      };
      opts.getSize = function (img, tagValue, tagName) {
        // FOR IMAGE COMING FROM A URL (IF TAGVALUE IS AN ADDRESS) :
        // To use this feature, you have to be using docxtemplater async
        // (if you are calling setData(), you are not using async).
        return new Promise(function (resolve, reject) {
          const image = new Image();

          image.src = url;
          image.width = 200;
          image.height = 100;
          image.onload = function (img, val) {
            resolve([image.width, image.height]);
          };
          image.onerror = function (e) {
            alert("An error occured while loading " + tagValue);
            reject(e);
          };
        });
      };

      // necessary for images rendering  but currently not available because it is a paid one.
      const imageModule = new ImageModule(opts);
      const zip = new PizZip(content);
      const doc = new Docxtemplater(zip, {
        linebreak: true,
        paragraphLoop: true,
        nullGetter: function () {
          return "";
        },
        // modules: [imageModule],
      });
      /* Data rendering */
      doc.resolveData(dtidata).then(function () {
        doc.render();
        const out = doc.getZip().generate({
          type: "blob",
          mimeType: docxType,
        });
        console.log(doc);

        saveAs(out, "generated.docx");
      });
    };
  };
  return (
    <div>
      <input type="file" id="doc" />
      <hr />
      <button onClick={generateDocx}>Generate DOCX document</button>;
    </div>
  );
};

export default DTITComponent;

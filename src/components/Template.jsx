import { useEffect, useState, useCallback,useRef } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import AceEditor from "react-ace";
import "ace-builds/src-noconflict/mode-liquid";
import "ace-builds/src-noconflict/theme-monokai";
import "ace-builds/src-noconflict/ext-searchbox";
import { Tabs } from "antd";

const { TabPane } = Tabs;

function Template() {
  const { templateName } = useParams();
  const [template, setTemplate] = useState("");
  const [data, setData] = useState({});
  const [output, setOutput] = useState("");
  const iframeRef = useRef(null);


  useEffect(() => {
    console.log("fetching template");
    axios
      .get(`http://localhost:3000/dev/report?templateName=${templateName}`)
      .then((response) => {
        setTemplate(response.data.template);
        setData(response.data.reportData);
        // After fetching the template, fetch the HTML
        return axios.post(
          `http://localhost:3000/dev/html?templateName=${templateName}`,
          {
            template: response.data.template,
            reportData: response.data.reportData,
          }
        );
      })
      .then((response) => {
        setOutput(response.data);
      })
      .catch((error) => console.error(error));
  }, []);
  useEffect(() => {
    const scaleElement = () => {
      const scaleFactor = (window.innerWidth*.5 / 1920 );
      if (iframeRef.current) {
        iframeRef.current.style.transform = `scale(${scaleFactor})`;
      }
    };

    window.addEventListener('resize', scaleElement);
    scaleElement(); // Call the function initially

    return () => {
      window.removeEventListener('resize', scaleElement);
    };
  }, []);



  const handleSave = useCallback(() => {
    axios
      .post(`http://localhost:3000/dev/html?templateName=${templateName}`, {
        template,
        reportData: data,
      })
      .then((response) => setOutput(response.data))
      .catch((error) => console.error(error));
  });

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.ctrlKey && event.key === "s") {
        event.preventDefault();
        handleSave();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleSave]);

  return (
    <div>
      <div className="o-container">
        <div className="editor">
          <Tabs defaultActiveKey="1" className="tabs">
            <TabPane tab="Template Code" key="1" className="tabs-pane">
              <AceEditor
                mode="liquid"
                theme="monokai"
                value={template}
                onChange={(newTemplate) => setTemplate(newTemplate)}
                name="UNIQUE_ID_OF_DIV"
                editorProps={{ $blockScrolling: true }}
                className="editor-full"
                commands={[
                  {
                    name: "search",
                    bindKey: { win: "Ctrl-F", mac: "Cmd-F" },
                    exec: (editor) => {
                      editor.execCommand("find");
                    },
                  },
                ]}
                setOptions={{ showPrintMargin: false }}
              />
            </TabPane>
            <TabPane tab="Data" key="2">
              <AceEditor
                mode="json"
                theme="monokai"
                value={data}
                onChange={(newData) => setData(JSON.parse(newData))}
                name="UNIQUE_ID_OF_DIV"
                editorProps={{ $blockScrolling: true }}
                className="editor-full"
                commands={[
                  {
                    name: "search",
                    bindKey: { win: "Ctrl-F", mac: "Cmd-F" },
                    exec: (editor) => {
                      editor.execCommand("find");
                    },
                  },
                ]}
                setOptions={{ showPrintMargin: false }}
              />
            </TabPane>
          </Tabs>
        </div>
        <div className="preview">
          {output && <iframe srcDoc={output} ref={iframeRef} className="iframe" />}
        </div>
      </div>
      <button className="save-button" onClick={handleSave}>
        Save
      </button>
    </div>
  );
}

export default Template;

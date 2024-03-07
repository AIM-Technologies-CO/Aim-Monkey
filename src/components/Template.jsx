import { useEffect, useState, useCallback } from "react";
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

  useEffect(() => {
    console.log("fetching template");
    axios
      .get(`http://localhost:3000/dev/report?templateName=${templateName}`)
      .then((response) => {
        setTemplate(response.data.template);
        setData(response.data.reportData);
        console.log(data);
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
  }, [templateName]);

  // useEffect(() => {
  //   if (!iframeRef.current) return;
  //   const iframe = iframeRef.current;
  //   const doc = iframe.contentDocument;
  //   doc.open();
  //   doc.write(output);
  //   doc.close();
  // }, [output]);

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
      <h1>Edit Template: {templateName}</h1>
      <div
        style={{
          display: "flex",
          width: "100vw",
          height: "80vh",
          paddingLeft: "10px",
          boxSizing: 'border-box',
        }}
      >
        <div style={{ width: "50%", height: "80vh" }}>
          <Tabs defaultActiveKey="1">
            <TabPane tab="Template Code" key="1">
              <AceEditor
                mode="liquid"
                theme="monokai"
                value={template}
                onChange={(newTemplate) => setTemplate(newTemplate)}
                name="UNIQUE_ID_OF_DIV"
                editorProps={{ $blockScrolling: true }}
                className="h-full"
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
                width="50vw"
                height="80vh"
                style={{ boxSizing: 'border-box' }}

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
                className="h-full"
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
                width="50vw"
                height="80vh"
                style={{ boxSizing: 'border-box' }}

              />
            </TabPane>
          </Tabs>
        </div>
        <div style={{ width: "50%", height: "80vh", overflow: "hidden" }}>
          {output && (
            <iframe
            srcDoc={output}
              style={{
                width: "1920px",
                height: "3000px",
                transform: "scale(0.5)",
                transformOrigin: "0 0",
                overflowX: "hidden",
                boxSizing: 'border-box',
                padding: "0",
              }}
            />
          )}
        </div>
      </div>
      <button
        style={{
          position: "absolute",
          top: "17px",
          left: "50px",
          padding: "10px",
          borderRadius: "5px",
          background: "black",
          color: "white",
        }}
        onClick={handleSave}
      >
        Save
      </button>
    </div>
  );
}

export default Template;

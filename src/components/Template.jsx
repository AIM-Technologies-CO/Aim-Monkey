import { useEffect, useState, useCallback, useRef } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import AceEditor from "react-ace";
import "ace-builds/src-noconflict/mode-liquid";
import "ace-builds/src-noconflict/theme-monokai";
import "ace-builds/src-noconflict/ext-searchbox";
import { Tabs } from "antd";
import { Document, Page, pdfjs } from "react-pdf";
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
import { useResizeDetector } from "react-resize-detector";

const { TabPane } = Tabs;

function Template() {
  const { templateName } = useParams();
  const [template, setTemplate] = useState("");
  const [data, setData] = useState({});
  const [output, setOutput] = useState("");
  const [pdf, setPdf] = useState(null);
  const [tab, setTab] = useState("html");
  const iframeRef = useRef(null);
  const [numPages, setNumPages] = useState(null);

  const { width, ref } = useResizeDetector();

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
  }

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

  const scaleElement = () => {
    const scaleFactor = (window.innerWidth * 0.5) / 1920;
    if (iframeRef.current) {
      iframeRef.current.style.transform = `scale(${scaleFactor})`;
    }
  };

  useEffect(() => {
    window.addEventListener("resize", scaleElement);
    return () => {
      window.removeEventListener("resize", scaleElement);
    };
  }, []);

  const handleSave = useCallback(() => {
    if (tab === "html") {
      axios
        .post(`http://localhost:3000/dev/html?templateName=${templateName}`, {
          template,
          reportData: data,
        })
        .then((response) => setOutput(response.data))
        .catch((error) => console.error(error));
    } else if (tab === "pdf") {
      console.log("fetching pdf");
      axios
        .post(
          `http://localhost:3000/dev/pdf?templateName=${templateName}`,
          {
            template,
            reportData: data,
          },
          {
            responseType: "blob",
          }
        )
        .then((response) => {
          const pdfBlob = new Blob([response.data], {
            type: "application/pdf",
          });
          setPdf(URL.createObjectURL(pdfBlob));
        })
        .catch((error) => console.error(error));
    }
  }, [tab, template, data, templateName]);

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
          <Tabs defaultActiveKey="html" className="tabs" onChange={setTab}>
            <TabPane tab="HTML" key="html">
              {tab === "html" && output && (
                <iframe
                  srcDoc={output}
                  ref={iframeRef}
                  className="iframe"
                  onLoad={scaleElement}
                />
              )}
            </TabPane>
            <TabPane tab="PDF" key="pdf">
              {tab === "pdf" && pdf && (
                <div ref={ref} style={{ overflow: "auto", height: "100vh" }}>
                  <Document file={pdf} onLoadSuccess={onDocumentLoadSuccess}>
                    {Array.from(new Array(numPages), (el, index) => (
                      <Page
                        key={`page_${index + 1}`}
                        pageNumber={index + 1}
                        renderAnnotationLayer={false}
                        renderTextLayer={false}
                        width={width}
                        className="pdf-page"
                      />
                    ))}
                  </Document>
                </div>
              )}
            </TabPane>
          </Tabs>{" "}
        </div>
      </div>
      <button className="save-button" onClick={handleSave}>
        Save
      </button>
    </div>
  );
}

export default Template;

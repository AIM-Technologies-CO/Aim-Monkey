import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { List, Modal } from "antd";

function Home() {
  const [templates, setTemplates] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    console.log("fetching templates");
    axios
      .get("http://localhost:3000/dev/templates")
      .then((response) => setTemplates(response.data))
      .catch((error) => {
        console.error(error);
        setIsModalVisible(true);
      });
  }, []);

  const handleOk = () => {
    setIsModalVisible(false);
  };

  return (
    <div className="grid-container">
      <h1 className="grid-title">Available Templates</h1>
      {templates.map((template) => (
        <List.Item
          key={template}
          className="list-item"
        >
          <Link
            to={`/template/${template}`}
            className="link"
          >
            {template}
          </Link>
        </List.Item>
      ))}
      <Modal
        title="Request failed"
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleOk}
      >
        <p>
          Make sure you have Aim-Pdf-Service running locally with the
          "report-devtool" branch
        </p>
      </Modal>
    </div>
  );
}

export default Home;

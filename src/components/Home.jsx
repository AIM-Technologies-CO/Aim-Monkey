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
    <div className="grid grid-cols-2 gap-4 justify-items-center items-center">
      <h1 className="col-span-2">Available Templates</h1>
      {templates.map((template) => (
        <List.Item
          key={template}
          className="p-4 border-b border-gray-200 bg-blue-500 mb-4 w-[400px]"
        >
          <Link
            to={`/template/${template}`}
            className="text-white hover:text-blue-700 font-bold"
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

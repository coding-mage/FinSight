import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, Button, Spinner, Modal } from 'react-bootstrap';
import '../css/newswithimpact.css';


const NewsWithImpact = () => {
  const [newsList, setNewsList] = useState([]);
  const [loadingNews, setLoadingNews] = useState(true);
  const [impactReport, setImpactReport] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchNews = async () => {
      
      try {
        const { data } = await axios.get(
          "http://localhost:5050/api/news/top-finance",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setNewsList(data.articles);
      } catch (error) {
        console.error("Error loading news:", error);
      } finally {
        setLoadingNews(false);
      }
    };

    fetchNews();
  }, [token,]);

  const renderStyledText = (text) => {
    const parts = text.split(/(\*\*.*?\*\*)/); // split by **...**

    return parts.map((part, idx) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        const content = part.slice(2, -2); // remove **
        return (
          <span key={idx} style={{ color: "#00ffe7", fontWeight: "bold" }}>
            {content}
          </span>
        );
      }
      return <span key={idx}>{part}</span>;
    });
  };

  const handleAnalyzeImpact = async (article) => {
  setAnalyzing(true);
  setShowModal(true);
  setImpactReport('');
  try {
    const { data } = await axios.post(
      'http://localhost:5050/api/news/analyze',
      {
        title: article.title,
        description: article.description,
        content: article.content,
      },
      {
        headers: {
          Authorization: `Bearer ${token}` 
        }
      }
    );
    setImpactReport(data.report);
  } catch (error) {
    setImpactReport('Error generating report.');
    console.error(error);
  } finally {
    setAnalyzing(false);
  }
};

  return (
    <div className="container my-4">
      <h3>Latest Financial News</h3>
      {loadingNews ? (
        <Spinner animation="border" />
      ) : (
        <div className="news-list">
          {newsList.map((article, idx) => (
            <Card key={idx} className="mb-3">
              <Card.Body>
                <Card.Title>{article.title}</Card.Title>
                <Card.Text>{article.description}</Card.Text>
                <Button
                  variant="outline-primary"
                  onClick={() => handleAnalyzeImpact(article)}
                  className = "btn-success"
                >
                  Analyze Impact
                </Button>
              </Card.Body>
            </Card>
          ))}
        </div>
      )}

      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" scrollable>
        <Modal.Header closeButton>
          <Modal.Title>Economic Impact Report</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {analyzing ? (
            <Spinner animation="border" />
          ) : (
            <pre style={{ whiteSpace: 'pre-wrap' }}>{renderStyledText(impactReport)}</pre>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default NewsWithImpact;

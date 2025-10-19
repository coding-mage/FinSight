import React, { useState } from 'react';
import { Accordion, Card, Button, Form, Spinner, Alert } from 'react-bootstrap';
import axios from 'axios';
import '../css/whatifsimulator.css';

const WhatIfSimulator = () => {
  const [query, setQuery] = useState('');
  const [analysis, setAnalysis] = useState(null); // parsed JSON data
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const token = localStorage.getItem('token');

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setAnalysis(null);

    try {
      const res = await axios.post(
        'http://localhost:5050/api/simulator/simulate',
        { scenario: query },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // The prediction is a string that contains JSON wrapped in triple backticks and "json"
      // Extract JSON string inside ```json ... ```
      const rawPrediction = res.data.prediction || '';
      const jsonMatch = rawPrediction.match(/```json\s*([\s\S]*?)```/);
      if (!jsonMatch) throw new Error('Invalid prediction format');

      const parsed = JSON.parse(jsonMatch[1]);
      setAnalysis(parsed.analysis);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch or parse simulation result.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container my-4">
      <h2 className="mb-4">What-If Scenario Simulator</h2>

      <Form onSubmit={handleSubmit}>
        <Form.Group>
          <Form.Control
            type="text"
            placeholder="Enter your hypothetical scenario"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            required
          />
        </Form.Group>
        <br></br>
        <Button variant="primary" type="submit" disabled={loading} className="btn-primary">
          {loading ? <Spinner animation="border" size="sm" /> : 'Simulate'}
        </Button>
      </Form>

      {error && <Alert variant="danger" className="mt-3">{error}</Alert>}

      {analysis && (
        <Card className="mt-4">
          <Card.Header>
            <strong>Simulation Results for: {analysis.scenario}</strong>
          </Card.Header>
          <Card.Body>
            <Accordion defaultActiveKey="0">
              {analysis.sections.map((section, idx) => (
                <Accordion.Item eventKey={idx.toString()} key={idx}>
                  <Accordion.Header>{section.heading}</Accordion.Header>
                  <Accordion.Body>
                    <p style={{ whiteSpace: 'pre-wrap' }}>{renderStyledText(section.content)}</p>
                  </Accordion.Body>
                </Accordion.Item>
              ))}
            </Accordion>
          </Card.Body>
        </Card>
      )}
    </div>
  );
};

export default WhatIfSimulator;

"use client";

import React, { useState } from "react";
import Layout from "./layout";

const Home: React.FC = () => {
  const [generatedTemplate, setGeneratedTemplate] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const handleGenerateTemplate = async () => {
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title, description }),
      });

      const data = await response.json();
      if (data.error) {
        console.log(data.error);
        return;
      }
      if (data) {
        console.log(
          'Template generated successfully, check path: "src/app/template.html"'
        );
        console.log(data);
        setGeneratedTemplate(data);
        alert(
          'Template generated successfully, check path: "src/app/template.html"'
        );
      }
      setGeneratedTemplate(data.generatedTemplate);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Layout>
      <main className="container mx-auto">
        {/* center */}
        <div className="text-center max-w-full mx-auto mt-8">
          <h1 className="text-4xl font-bold mb-4">Landing Page Generator</h1>
          <h2 className="text-2xl font-bold mb-4">
            Create a Stunning Landing Page
          </h2>
          <p className="text-lg">
            Boost your online presence with our AI-powered landing page
            generator. Get a professionally designed page with just a few
            clicks. Stand out from the competition and attract more visitors to
            your website.
          </p>
        </div>
        <form className="flex flex-col max-w-2xl mx-auto mt-8">
          <div className="mt-8"></div>
          <label className="mb-2" htmlFor="title">
            <b>Title:</b>
          </label>
          <input
            className="border border-gray-300 rounded-md p-2 mb-4"
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <label className="mb-2" htmlFor="description">
            <b>Description:</b>
          </label>
          <textarea
            id="description"
            value={description}
            rows={4}
            onChange={(e) => setDescription(e.target.value)}
            className="border border-gray-300 rounded-md p-2 mb-2"
          />

          <button
            onClick={handleGenerateTemplate}
            className="bg-blue-500 text-white px-4 py-2 rounded-md"
          >
            Generate Landing Page
          </button>
        </form>
      </main>
      {generatedTemplate && (
        <div className="container mx-auto mt-8">
          <h2 className="text-2xl font-bold mb-4">Template Generated</h2>
        </div>
      )}
    </Layout>
  );
};

export default Home;

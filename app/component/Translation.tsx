"use client";

import { useState, useEffect, useRef } from "react";
import {
  AiOutlineAudio,
  AiOutlineCopy,
  AiOutlineSound,
  AiOutlineStop,
} from "react-icons/ai";
import { FiRefreshCw } from "react-icons/fi";
import Notification from "./Notification";

// Debounce function to limit API calls
const debounce = (func: Function, delay: number) => {
  let timeoutId: NodeJS.Timeout;
  return (...args: any[]) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}

const Translator = () => {
  const [text, setText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [sourceLanguage, setSourceLanguage] = useState("en");
  const [targetLanguage, setTargetLanguage] = useState("ja");
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "warning" | "error";
  } | null>(null);
  const [speaking, setSpeaking] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const translatedTextareaRef = useRef<HTMLTextAreaElement>(null);
  const maxChars = 500;

  // Debounced translate function
  const debouncedTranslate = debounce(async (text: string) => {
    if (text.trim() === "") {
      setTranslatedText("");
      return;
    }

    const response = await fetch(
      `https://api.mymemory.translated.net/get?q=${text}&langpair=${sourceLanguage}|${targetLanguage}`
    );
    const data = await response.json();
    setTranslatedText(data.responseData.translatedText);
  }, 500);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
    if (translatedTextareaRef.current) {
      translatedTextareaRef.current.style.height = "auto";
      translatedTextareaRef.current.style.height = `${translatedTextareaRef.current.scrollHeight}px`;
    }
  }, [text, translatedText]);

  useEffect(() => {
    if (text.length <= maxChars) {
      debouncedTranslate(text);
    }
  }, [text]);

  const handleTranslate = async () => {
    if (text.trim() === "") {
      setNotification({
        message: "Type something to translate",
        type: "warning",
      });
      return;
    }

    const response = await fetch(
      `https://api.mymemory.translated.net/get?q=${text}&langpair=${sourceLanguage}|${targetLanguage}`
    );
    const data = await response.json();
    setTranslatedText(data.responseData.translatedText);
  };

  const handleSpeak = (textToSpeak: string, language: string) => {
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
    } else {
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.lang = language;
      utterance.onend = () => setSpeaking(false);
      window.speechSynthesis.speak(utterance);
      setSpeaking(true);
    }
  };

  const getSpeechLanguageCode = (lang: string) => {
    switch (lang) {
      case "it":
        return "it-IT";
      case "es":
        return "es-ES";
      case "de":
        return "de-DE";
      case "ja":
        return "ja-JP";
      case "ar":
        return "ar-SA";
      case "hi":
        return "hi-IN";
      case "en":
        return "en-US";
      default:
        return "en-US";
    }
  };

  const startListening = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = getSpeechLanguageCode(sourceLanguage);
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    setNotification({ message: "Listening", type: "success" });

    recognition.start();

    recognition.onresult = (event: any) => {
      const speechResult = event.results[0][0].transcript;
      setText(speechResult);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event);
    };
  };

  const handleCopy = (textToCopy: string) => {
    navigator.clipboard
      .writeText(textToCopy)
      .then(() => {
        setNotification({ message: "Copied successfully 🍀", type: "success" });
      })
      .catch((error) => {
        console.error("Copy to clipboard failed", error);
      });
  };

  const handleInterchange = () => {
    const tempLang = sourceLanguage;
    setSourceLanguage(targetLanguage);
    setTargetLanguage(tempLang);

    const tempText = text;
    setText(translatedText);
    setTranslatedText(tempText);
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (e.target.value.length <= maxChars) {
      setText(e.target.value);
    } else {
      setNotification({
        message: `Only ${maxChars} characters allowed`,
        type: "warning",
      });
    }
  };

  return (
    <div className="flex flex-col items-center  w-screen justify-center  min-h-screen">
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
      <div className="flex flex-col md:flex-row w-full max-w-5xl gap-4 mb-4">
        <div className="md:w-1/2 w-full">
          <div className="relative">
            <textarea
              ref={textareaRef}
              className="border border-[#31363F] bg-[#222831] rounded-lg p-3 w-full min-h-[150px] resize-none focus:outline-none focus:ring-2 focus:border-slate-800"
              value={text}
              onChange={handleTextChange}
              placeholder="Enter text to translate"
            />
            <div className="absolute bottom-0 right-0 px-2 py-2 text-sm text-gray-600">
              {text.length}/{maxChars}
            </div>
          </div>
          <div className="flex gap-2 ">
            <button
              onClick={startListening}
              className=" p-2 rounded-full shadow-md bg-gray-800 transition"
              title="Start voice input"
            >
              <AiOutlineAudio className="text-xl" />
            </button>
            <button
              onClick={() => handleCopy(text)}
              className=" p-2 rounded-full shadow-md bg-gray-800 transition"
              title="Copy text"
            >
              <AiOutlineCopy className="text-xl" />
            </button>
            <button
              onClick={() =>
                handleSpeak(text, getSpeechLanguageCode(sourceLanguage))
              }
              className={`p-2 rounded-full shadow-md transition ${
                speaking ? "bg-red-500 text-white" : " bg-gray-800"
              }`}
              title="Play text"
            >
              {speaking ? (
                <AiOutlineStop className="text-xl" />
              ) : (
                <AiOutlineSound className="text-xl" />
              )}
            </button>
          </div>
        </div>
        <div className="md:w-1/2 w-full">
          <textarea
            ref={translatedTextareaRef}
            className="border border-[#31363F] bg-[#222831] rounded-lg p-3 w-full min-h-[150px] resize-none focus:outline-none focus:ring-2 focus:border-slate-800"
            value={translatedText}
            readOnly
            placeholder="Translation will appear here"
          />
          <div className="flex gap-2 ">
            <button
              onClick={() => handleCopy(translatedText)}
              className=" p-2 rounded-full shadow-md bg-gray-800 transition"
              title="Copy translated text"
            >
              <AiOutlineCopy className="text-xl" />
            </button>
            <button
              onClick={() =>
                handleSpeak(
                  translatedText,
                  getSpeechLanguageCode(targetLanguage)
                )
              }
              className={`p-2 rounded-full shadow-md transition ${
                speaking ? "bg-red-500 text-white" : " bg-gray-800"
              }`}
              title="Play translated text"
            >
              {speaking ? (
                <AiOutlineStop className="text-xl" />
              ) : (
                <AiOutlineSound className="text-xl" />
              )}
            </button>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-4 mb-4 w-1/2 ">
        <div className="w-full">
          <select
            id="sourceLanguage"
            value={sourceLanguage}
            onChange={(e) => setSourceLanguage(e.target.value)}
            className="border bg-gray-800 text-white w-full border-gray-800 rounded-lg p-2"
          >
            <option
              className="bg-gray-800 py-1 px-2 text-white text-center"
              value="en"
            >
              English
            </option>
            <option
              className="bg-gray-800 py-1 px-2 text-white text-center"
              value="it"
            >
              Italian
            </option>
            <option
              className="bg-gray-800 py-1 px-2 text-white text-center"
              value="es"
            >
              Spanish
            </option>
            <option
              className="bg-gray-800 py-1 px-2 text-white text-center"
              value="de"
            >
              German
            </option>
            <option
              className="bg-gray-800 py-1 px-2 text-white text-center"
              value="ja"
            >
              Japanese
            </option>
            <option
              className="bg-gray-800 py-1 px-2 text-white text-center"
              value="ar"
            >
              Arabic
            </option>
            <option
              className="bg-gray-800 py-1 px-2 text-white text-center"
              value="hi"
            >
              Hindi
            </option>
          </select>
        </div>
        <button
          onClick={handleInterchange}
          className=" p-2 rounded-full shadow-md bg-gray-800 transition"
          title="Interchange languages"
        >
          <FiRefreshCw className="text-xl" />
        </button>
        <div className="w-full">
          <select
            id="targetLanguage"
            value={targetLanguage}
            onChange={(e) => setTargetLanguage(e.target.value)}
            className="border bg-gray-800 text-white w-full border-gray-800 rounded-lg p-2"
          >
            <option
              className="bg-gray-800 py-1 px-2 text-white text-center"
              value="en"
            >
              English
            </option>
            <option
              className="bg-gray-800 py-1 px-2 text-white text-center"
              value="it"
            >
              Italian
            </option>
            <option
              className="bg-gray-800 py-1 px-2 text-white text-center"
              value="es"
            >
              Spanish
            </option>
            <option
              className="bg-gray-800 py-1 px-2 text-white text-center"
              value="de"
            >
              German
            </option>
            <option
              className="bg-gray-800 py-1 px-2 text-white text-center"
              value="ja"
            >
              Japanese
            </option>
            <option
              className="bg-gray-800 py-1 px-2 text-white text-center"
              value="ar"
            >
              Arabic
            </option>
            <option
              className="bg-gray-800 py-1 px-2 text-white text-center"
              value="hi"
            >
              Hindi
            </option>
          </select>
        </div>
      </div>
      <div className="flex justify-center items-center">
        <button onClick={handleTranslate} className="border px-4 py-2 mt-4 bg-gradient-to-tr from-black to-neutral-900 rounded border-gray-800">
          Translate
        </button>
      </div>
    </div>
  );
};

export default Translator;

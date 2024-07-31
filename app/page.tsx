"use client";

import { useState, useEffect, useRef } from "react";
import {
  AiOutlineAudio,
  AiOutlineCopy,
  AiOutlineSound,
  AiOutlineStop,
} from "react-icons/ai";
import { FiRefreshCw } from "react-icons/fi";
import Notification from "./component/Notification";

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
  const [copyMessage, setCopyMessage] = useState("");
  const [warningMessage, setWarningMessage] = useState("");
  const [notification, setNotification] = useState<{ message: string; type: "success" | "warning" | "error" } | null>(null);
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
      setWarningMessage("Type something to translate");
      setNotification({ message: "Type something to translate", type: "warning" });
      return;
    }

    const response = await fetch(
      `https://api.mymemory.translated.net/get?q=${text}&langpair=${sourceLanguage}|${targetLanguage}`
    );
    const data = await response.json();
    setTranslatedText(data.responseData.translatedText);
    setWarningMessage("");
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
        setCopyMessage("Copied successfully 🍀");
        setNotification({ message: "Copied successfully 🍀", type: "success" });
        setTimeout(() => setCopyMessage(""), 2000);
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
      setWarningMessage("");
    } else {
      setWarningMessage(`Only ${maxChars} characters allowed`);
      setNotification({ message: `Only ${maxChars} characters allowed`, type: "warning" });
    }
  };

  const handleInputClear = () => {
    setText("");
    setTranslatedText("");
  };

  return (
    <div className="flex flex-col items-center pt-8 p-6 bg-gray-100 min-h-screen">
      {notification && <Notification message={notification.message} type={notification.type} />}
      <h1 className="text-3xl mb-6 font-bold text-gray-800">Translator</h1>
      <div className="flex flex-col md:flex-row w-full max-w-5xl gap-4 mb-4">
        <div className=" md:w-1/2 w-full ">
          <div className="relative ">
            <textarea
              ref={textareaRef}
              className="border border-gray-300 rounded-lg p-3 w-full min-h-[150px] resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={text}
              onChange={handleTextChange}
              placeholder="Enter text to translate"
            />
            <div className="absolute bottom-0 right-0 p-2 text-sm text-gray-600">
              {text.length}/{maxChars}
            </div>
            
          </div>
          <div className="flex gap-2">
            <button
              onClick={startListening}
              className="bg-gray-200 p-2 rounded-full shadow-md hover:bg-gray-300 transition"
              title="Start voice input"
            >
              <AiOutlineAudio className="text-xl" />
            </button>
            <button
              onClick={() => handleCopy(text)}
              className="bg-gray-200 p-2 rounded-full shadow-md hover:bg-gray-300 transition"
              title="Copy text"
            >
              <AiOutlineCopy className="text-xl" />
            </button>
            <button
              onClick={() =>
                handleSpeak(text, getSpeechLanguageCode(sourceLanguage))
              }
              className={`p-2 rounded-full shadow-md transition ${
                speaking ? "bg-red-500 text-white" : "bg-gray-200 hover:bg-gray-300"
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
        <div className=" w-full md:w-1/2">
          <textarea
            ref={translatedTextareaRef}
            className="border border-gray-300 rounded-lg p-3 w-full min-h-[150px] resize-none bg-gray-50"
            value={translatedText}
            readOnly
            placeholder="Translation"
          />
          <div className="flex gap-2">
            <button
              onClick={() => handleCopy(translatedText)}
              className="bg-gray-200 p-2 rounded-full shadow-md hover:bg-gray-300 transition"
              title="Copy translated text"
            >
              <AiOutlineCopy className="text-xl" />
            </button>
            <button
              onClick={() =>
                handleSpeak(translatedText, getSpeechLanguageCode(targetLanguage))
              }
              className={`p-2 rounded-full shadow-md transition ${
                speaking ? "bg-red-500 text-white" : "bg-gray-200 hover:bg-gray-300"
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
      <div className="flex gap-5">
        <select
          value={sourceLanguage}
          onChange={(e) => setSourceLanguage(e.target.value)}
          className="border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="en">English</option>
          <option value="es">Spanish</option>
          <option value="de">German</option>
          <option value="it">Italian</option>
          <option value="ja">Japanese</option>
          <option value="ar">Arabic</option>
          <option value="hi">Hindi</option>
        </select>
        <button
          onClick={handleInterchange}
          className="bg-blue-500 text-white p-2 rounded-full shadow-md hover:bg-blue-600 transition"
          title="Swap languages"
        >
          <FiRefreshCw className="text-xl" />
        </button>
        <select
          value={targetLanguage}
          onChange={(e) => setTargetLanguage(e.target.value)}
          className="border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="en">English</option>
          <option value="es">Spanish</option>
          <option value="de">German</option>
          <option value="it">Italian</option>
          <option value="ja">Japanese</option>
          <option value="ar">Arabic</option>
          <option value="hi">Hindi</option>
        </select>
       
      </div>
      <button
          onClick={handleTranslate}
          className="bg-blue-500 mt-5 w-full md:max-w-5xl text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-600 transition"
        >
          Translate
        </button>
    </div>
  );
};

export default Translator;

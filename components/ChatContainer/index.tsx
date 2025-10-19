//@ts-nocheck
import React, { useRef, useEffect } from "react";
import "./index.css";
import { motion as m } from "framer-motion";
import useQuiverStore from "../../store";

interface ChatProp {
  isUser: boolean;
  query: string;
}

const Chat: React.FC<ChatProp> = ({ isUser, query }) => {
  return (
    <div
      className="chat"
      style={{
        marginLeft: isUser && "auto",
        marginRight: !isUser && "auto",
        background: !isUser && "transparent",
      }}
    >
      {query}
    </div>
  );
};

const index = () => {
  const chatContext = useQuiverStore((state) => state.chatContext);
  const chatEndRef = useRef(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    const container = chatEndRef.current;
    if (container) {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: "smooth", // or "auto" if you don’t want animation
      });
    }
  }, [chatContext]);
  return (
    <m.div
      className="chatContainer"
      initial={{ opacity: 0, y: 200 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        type: "spring",
        stiffness: 120, // controls "speed" of bounce
        damping: 10, // lower = more bounce
        duration: 0.8,
      }}
      ref={chatEndRef}
    >
      <div>
        {chatContext.map((chat) => {
          return <Chat isUser={chat.isUser} query={chat.query} />;
        })}
      </div>
    </m.div>
  );
};

export default index;

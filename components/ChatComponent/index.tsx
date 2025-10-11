import { useEffect, useRef } from "react";
import { motion as m } from "framer-motion";
import "./index.css";

const index = () => {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const onFocus = () => console.log("focused");
    const onBlur = () => console.log("blurred");

    el.addEventListener("focus", onFocus);
    el.addEventListener("blur", onBlur);

    return () => {
      el.removeEventListener("focus", onFocus);
      el.removeEventListener("blur", onBlur);
    };
  }, []);
  return (
    <div className="chatHolder">
      <textarea placeholder="Try agent mode" ref={ref}></textarea>
      <m.div className="btn" whileTap={{ scale: 1.2 }}>
        <i className="fa-solid fa-arrow-up"></i>
      </m.div>
    </div>
  );
};

export default index;

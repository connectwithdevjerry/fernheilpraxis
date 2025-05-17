import { useContext } from "react";
import { LangContext } from "./langContext";

export const useLang = () => useContext(LangContext);

import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "@/redux/store/store";
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector = <TSelected>(selector: (state: RootState) => TSelected, defaultValue?: TSelected) => {
  const selected = useSelector(selector);
  return selected !== undefined && selected !== null ? selected : defaultValue;
};

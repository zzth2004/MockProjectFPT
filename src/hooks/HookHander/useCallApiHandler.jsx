import { useReducer, useCallback } from 'react';


const initDatasState = {
  data: null,
  loading: false,
  error: null,
};

const datasReducer = (state, action) => {
  switch (action.type) {
    case 'START':
      return { ...state, loading: true, error: null };
    case 'SUCCESS':
      return { ...state, loading: false, data: action.data };
    case 'ERROR':
      return { ...state, loading: false, error: action.error };
    case 'END':
      return { ...state, loading: false };
    default:
      return state;
  }
};
/**
 * Hook call API kèm state loading, error, data
 * @param {Function} apiFn - Hàm API truyền vào
 */
// Custom hook
export default function useCallApiHandler(apiFn) {
  const [state, dispatch] = useReducer(datasReducer, initDatasState);

  const call = useCallback(async (...args) => {
    dispatch({ type: 'START' });

    try {
      const data = await apiFn(...args);

      if (data) {
        dispatch({ type: 'SUCCESS', data: data });
        return data;
      } else {
        throw new Error(`Call API failed`);
      }
    } catch (error) {
      if (error.name === "CanceledError") {
        dispatch({ type: "ERROR", error: "AbortError" });

      } else {
        dispatch({
          type: 'ERROR',
          error: error.response?.data || error
        });

      }
      throw error;
    } finally {
      dispatch({ type: 'END' });
    }
  }, [apiFn]);

  return {
    ...state,
    call,
  };
}

import { useState } from "react";

export default function useFormHandler({ initialValues, validators = {}, apiFn, onSuccess, onError }) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const setField = (field, value) => {
    setValues((prev) => ({ ...prev, [field]: value }));
  };

  const validate = () => {
    let newErrors = {};
    for (let key in validators) {
      const error = validators[key]?.(values[key], values) || "";
      if (error) newErrors[key] = error;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setLoading(true);
      const res = await apiFn(values);
      onSuccess?.(res, values);
    } catch (err) {
      onError?.(err);
    } finally {
      setLoading(false);
    }
  };

  return {
    values,
    errors,
    setField,
    handleSubmit,
    loading,
  };
}

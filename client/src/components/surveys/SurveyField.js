/* eslint-disable import/no-anonymous-default-export */
// SurveyField contains logic to render a single label and text input
import React from "react";

export default ({ input, label, meta: { error, touched } }) => {
  return (
    <div>
      <label>{label}</label>
      <input {...input} style={{ marginBottom: "5px" }} />
      <div className="red-text text-darken-4" style={{ marginBottom: "20px" }}>
        {touched && error}
      </div>
    </div>
  );
};

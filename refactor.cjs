const fs = require('fs');
const path = require('path');

const dirPath = path.join(__dirname, 'src', 'AdminControl', 'Admin', 'Course', 'Lesson', 'Material');
const examPath = path.join(dirPath, 'exam.ui.jsx');

if (!fs.existsSync(examPath)) {
    console.error("exam.ui.jsx not found!");
    process.exit(1);
}

const content = fs.readFileSync(examPath, 'utf8');

// 1. Extract handleImportJson
const importMatch = content.match(/const handleImportJson = \(e\) => \{[\s\S]*?\n    \};\n/);
let handleImportJsonCode = importMatch ? importMatch[0] : "";

// 2. Extract handleAiGenerateQuestions
const aiMatch = content.match(/const handleAiGenerateQuestions = async \(\) => \{[\s\S]*?\n    \};\n/);
let handleAiGenerateQuestionsCode = aiMatch ? aiMatch[0] : "";

// 3. Extract questionHelpers (inside window.exerciseHelpers)
const helpersMatch = content.match(/window\.exerciseHelpers = (\{[\s\S]*?\n                \});/);
let helpersCode = helpersMatch ? helpersMatch[1] : "{}";

// Now, we generate the useMaterialQuestions.js file
const hookContent = `import { useState } from "react";
import vocabService from "../../../../Service/API/lessonServiceAPI/vocab.service";
import grammarService from "../../../../Service/API/lessonServiceAPI/grammarService.service";
import AiService from "../../../../Service/API/aiAPI/ai.service";

export default function useMaterialQuestions(formData, setFormData, lessonId = null) {
    const [showAiGeneratePanel, setShowAiGeneratePanel] = useState(false);
    const [aiQuestionsCount, setAiQuestionsCount] = useState(5);
    const [aiSelectedTypes, setAiSelectedTypes] = useState(["multiple_choice", "fill_blank"]);
    const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);

    const [showJsonInput, setShowJsonInput] = useState(false);
    const [jsonText, setJsonText] = useState("");

    // --- JSON / EXCEL IMPORT ---
    ${handleImportJsonCode.replace(/const handleImportJson/g, 'const handleImportJson')}

    // --- AI GENERATE ---
    ${handleAiGenerateQuestionsCode.replace(/const handleAiGenerateQuestions/g, 'const handleAiGenerateQuestions')}

    // --- QUESTION HELPERS ---
    const questionHelpers = ${helpersCode};

    return {
        showAiGeneratePanel, setShowAiGeneratePanel,
        aiQuestionsCount, setAiQuestionsCount,
        aiSelectedTypes, setAiSelectedTypes,
        isGeneratingQuestions, setIsGeneratingQuestions,
        showJsonInput, setShowJsonInput,
        jsonText, setJsonText,
        handleImportJson,
        handleAiGenerateQuestions,
        questionHelpers
    };
}
`;

fs.writeFileSync(path.join(dirPath, 'useMaterialQuestions.js'), hookContent, 'utf8');
console.log("Created useMaterialQuestions.js");

// 4. Extract QuestionBuilder UI
const uiStartMatch = content.indexOf('<div className="flex justify-between items-center border-b pb-2 flex-wrap gap-2">');
const uiEndMatch = content.indexOf('{/* Form Footer Buttons */}');

if (uiStartMatch !== -1 && uiEndMatch !== -1) {
    let uiCode = content.substring(uiStartMatch, uiEndMatch);
    
    // Replace window.exerciseHelpers with questionHelpers
    uiCode = uiCode.replace(/window\.exerciseHelpers\./g, 'questionHelpers.');
    
    const componentContent = `import React from "react";
import { Plus, Sparkles, Code, X, HelpCircle, ArrowUp, ArrowDown, Trash2 } from "lucide-react";

export default function QuestionBuilder({
    formData,
    isViewMode,
    // Hook states
    showAiGeneratePanel, setShowAiGeneratePanel,
    aiQuestionsCount, setAiQuestionsCount,
    aiSelectedTypes, setAiSelectedTypes,
    isGeneratingQuestions,
    showJsonInput, setShowJsonInput,
    jsonText, setJsonText,
    handleImportJson,
    handleAiGenerateQuestions,
    questionHelpers
}) {
    return (
        <div className="space-y-6">
            ${uiCode}
        </div>
    );
}
`;
    fs.writeFileSync(path.join(dirPath, 'QuestionBuilder.jsx'), componentContent, 'utf8');
    console.log("Created QuestionBuilder.jsx");
} else {
    console.error("Could not find Question UI block");
}

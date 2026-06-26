const fs = require('fs');
const path = require('path');

const dirPath = path.join(__dirname, 'src', 'AdminControl', 'Admin', 'Course', 'Lesson', 'Material');
const examPath = path.join(dirPath, 'exam.ui.jsx');
const exercisePath = path.join(dirPath, 'exercise.ui.jsx');

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');

    // 1. Remove handleImportJson
    content = content.replace(/const handleImportJson = \(e\) => \{[\s\S]*?\n    \};\n/m, '');

    // 2. Remove handleAiGenerateQuestions
    content = content.replace(/const handleAiGenerateQuestions = async \(\) => \{[\s\S]*?\n    \};\n/m, '');

    // 3. Remove window.exerciseHelpers block
    content = content.replace(/\{\/\* --- QUESTION & OPTION HELPERS ---\s*\*\/\}[\s\S]*?\}\(\)\}\n/m, '');

    // 4. Remove UI block
    // We match from "{/* SECTION 2: QUESTIONS LIST */}" up to "{/* Form Footer Buttons */}"
    const uiRegex = /\{\/\* SECTION 2: QUESTIONS LIST \*\/\}\n[\s\S]*?(?=\{\/\* Form Footer Buttons \*\/})/m;
    const builderProps = `{/* SECTION 2: QUESTIONS LIST */}
                            <QuestionBuilder
                                formData={formData}
                                isViewMode={isViewMode}
                                showAiGeneratePanel={showAiGeneratePanel}
                                setShowAiGeneratePanel={setShowAiGeneratePanel}
                                aiQuestionsCount={aiQuestionsCount}
                                setAiQuestionsCount={setAiQuestionsCount}
                                aiSelectedTypes={aiSelectedTypes}
                                setAiSelectedTypes={setAiSelectedTypes}
                                isGeneratingQuestions={isGeneratingQuestions}
                                showJsonInput={showJsonInput}
                                setShowJsonInput={setShowJsonInput}
                                jsonText={jsonText}
                                setJsonText={setJsonText}
                                handleImportJson={handleImportJson}
                                handleAiGenerateQuestions={handleAiGenerateQuestions}
                                questionHelpers={questionHelpers}
                            />\n\n                            `;
    content = content.replace(uiRegex, builderProps);

    // 5. Inject imports at the top
    const importHook = `import useMaterialQuestions from "./useMaterialQuestions";\nimport QuestionBuilder from "./QuestionBuilder";\n`;
    content = content.replace(/import React.*?;/, (match) => match + '\n' + importHook);

    // 6. Replace old AI/JSON states and insert useMaterialQuestions call
    const hookCall = `\n    // --- SHARED MATERIAL QUESTIONS HOOK ---
    const {
        showAiGeneratePanel, setShowAiGeneratePanel,
        aiQuestionsCount, setAiQuestionsCount,
        aiSelectedTypes, setAiSelectedTypes,
        isGeneratingQuestions, setIsGeneratingQuestions,
        showJsonInput, setShowJsonInput,
        jsonText, setJsonText,
        handleImportJson,
        handleAiGenerateQuestions,
        questionHelpers
    } = useMaterialQuestions(formData, setFormData, lessonId);\n`;
    
    content = content.replace(/const \[showAiGeneratePanel[\s\S]*?useState.*?;\n/g, '');
    content = content.replace(/const \[aiQuestionsCount[\s\S]*?useState.*?;\n/g, '');
    content = content.replace(/const \[aiSelectedTypes[\s\S]*?useState.*?;\n/g, '');
    content = content.replace(/const \[isGeneratingQuestions[\s\S]*?useState.*?;\n/g, '');
    content = content.replace(/const \[showJsonInput[\s\S]*?useState.*?;\n/g, '');
    content = content.replace(/const \[jsonText[\s\S]*?useState.*?;\n/g, '');

    // Insert the hook call after isViewMode state
    content = content.replace(/(const \[isViewMode, setIsViewMode\] = useState\(false\);)/, `$1\n${hookCall}`);

    fs.writeFileSync(filePath, content, 'utf8');
}

processFile(examPath);
processFile(exercisePath);
console.log("Refactored both exam.ui.jsx and exercise.ui.jsx");

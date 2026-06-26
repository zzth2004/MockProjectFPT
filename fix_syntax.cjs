const fs = require('fs');
const path = require('path');

const dirPath = path.join(__dirname, 'src', 'AdminControl', 'Admin', 'Course', 'Lesson', 'Material');
const examPath = path.join(dirPath, 'exam.ui.jsx');
const exercisePath = path.join(dirPath, 'exercise.ui.jsx');
const questionBuilderPath = path.join(dirPath, 'QuestionBuilder.jsx');

// Fix QuestionBuilder.jsx
if (fs.existsSync(questionBuilderPath)) {
    let qbContent = fs.readFileSync(questionBuilderPath, 'utf8');
    // Add missing imports
    qbContent = qbContent.replace(/import \{.*?\} from "lucide-react";/, (match) => {
        return `import { Plus, Sparkles, Code, X, HelpCircle, ArrowUp, ArrowDown, Trash, Trash2, Loader2, Database } from "lucide-react";`;
    });

    // Remove the extra </div> near the end
    // It's after the end of the form Footer Buttons wrapper or space-y-6 wrapper
    qbContent = qbContent.replace(/<\/div>\s*<\/div>\s*\);\s*\}\s*$/m, '        </div>\n    );\n}');

    fs.writeFileSync(questionBuilderPath, qbContent, 'utf8');
}

// Fix exam.ui.jsx
if (fs.existsSync(examPath)) {
    let examContent = fs.readFileSync(examPath, 'utf8');
    // Find the useMaterialQuestions hook call
    const hookCallRegex = /\n\s*\/\/\s*---\s*SHARED MATERIAL QUESTIONS HOOK\s*---[\s\S]*?useMaterialQuestions\(formData,\s*setFormData,\s*lessonId\);\n/;
    const match = examContent.match(hookCallRegex);
    if (match) {
        // Remove it from current location
        examContent = examContent.replace(match[0], '');
        // Find formData definition and place it right after
        const formDataRegex = /const \[formData, setFormData\] = useState\(\{[\s\S]*?\}\);\n/;
        examContent = examContent.replace(formDataRegex, (m) => m + match[0]);
    }
    fs.writeFileSync(examPath, examContent, 'utf8');
}

// Fix exercise.ui.jsx
if (fs.existsSync(exercisePath)) {
    let exContent = fs.readFileSync(exercisePath, 'utf8');
    const hookCallRegex = /\n\s*\/\/\s*---\s*SHARED MATERIAL QUESTIONS HOOK\s*---[\s\S]*?useMaterialQuestions\(formData,\s*setFormData,\s*lessonId\);\n/;
    const match = exContent.match(hookCallRegex);
    if (match) {
        exContent = exContent.replace(match[0], '');
        const formDataRegex = /const \[formData, setFormData\] = useState\(\{[\s\S]*?\}\);\n/;
        exContent = exContent.replace(formDataRegex, (m) => m + match[0]);
    }
    fs.writeFileSync(exercisePath, exContent, 'utf8');
}

console.log("Syntax fixed");

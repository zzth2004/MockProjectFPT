import React from "react";
import useGameRoomSocket from "./hooks/useGameRoomSocket";
import useExerciseManager from "./hooks/useExerciseManager";

import Header from "./components/Header";
import ExerciseSelector from "./components/ExerciseSelector";
import RoomControl from "./components/RoomControl";
import ExerciseCreator from "./components/ExerciseCreator";
import Leaderboard from "./components/Leaderboard";
import ConsoleLog from "./components/ConsoleLog";
import PreviewModal from "./components/PreviewModal";

export default function GameRoomHost() {
  const socketControl = useGameRoomSocket();
  const exManager = useExerciseManager(socketControl.addLog);

  return (
    <div style={{ minHeight: "100vh", background: "#0f172a", color: "#f8fafc", fontFamily: "'Inter',sans-serif", padding: 24 }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", flexDirection: "column", gap: 20 }}>
        
        {/* Header component */}
        <Header
          connected={socketControl.connected}
          gameStatus={socketControl.gameStatus}
        />

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          
          {/* Left panel: Selector + Controller */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <ExerciseSelector
              exercises={exManager.exercises}
              loadingEx={exManager.loadingEx}
              searchQ={exManager.searchQ}
              setSearchQ={exManager.setSearchQ}
              selectedEx={exManager.selectedEx}
              setSelectedEx={exManager.setSelectedEx}
              handlePreview={exManager.handlePreview}
              loadExercises={exManager.loadExercises}
              addLog={socketControl.addLog}
            />

            <RoomControl
              room={socketControl.room}
              selectedEx={exManager.selectedEx}
              players={socketControl.players}
              gameStatus={socketControl.gameStatus}
              connected={socketControl.connected}
              handleCreateRoom={socketControl.handleCreateRoom}
              handleStart={socketControl.handleStart}
              handleEnd={socketControl.handleEnd}
              handleDisconnect={socketControl.handleDisconnect}
            />
          </div>

          {/* Right panel: Exercise Creator */}
          <ExerciseCreator
            createTab={exManager.createTab}
            setCreateTab={exManager.setCreateTab}
            creating={exManager.creating}
            createResult={exManager.createResult}
            manualForm={exManager.manualForm}
            setManualForm={exManager.setManualForm}
            questions={exManager.questions}
            addQuestion={exManager.addQuestion}
            updateQuestion={exManager.updateQuestion}
            updateOption={exManager.updateOption}
            removeQuestion={exManager.removeQuestion}
            jsonText={exManager.jsonText}
            setJsonText={exManager.setJsonText}
            importFile={exManager.importFile}
            setImportFile={exManager.setImportFile}
            importMode={exManager.importMode}
            setImportMode={exManager.setImportMode}
            importLevel={exManager.importLevel}
            setImportLevel={exManager.setImportLevel}
            importSkill={exManager.importSkill}
            setImportSkill={exManager.setImportSkill}
            aiTopic={exManager.aiTopic}
            setAiTopic={exManager.setAiTopic}
            aiCount={exManager.aiCount}
            setAiCount={exManager.setAiCount}
            aiLevel={exManager.aiLevel}
            setAiLevel={exManager.setAiLevel}
            handleCreateManual={exManager.handleCreateManual}
            handleCreateJson={exManager.handleCreateJson}
            handleImport={exManager.handleImport}
            handleAiGenerate={exManager.handleAiGenerate}
          />

          {/* Leaderboard table */}
          <Leaderboard players={socketControl.players} />

          {/* Console logs terminal */}
          <ConsoleLog logs={socketControl.logs} clearLogs={socketControl.clearLogs} />

        </div>
      </div>

      {/* Preview modal for exercise detail view */}
      <PreviewModal
        showPreview={exManager.showPreview}
        setShowPreview={exManager.setShowPreview}
        loadingPreview={exManager.loadingPreview}
        preview={exManager.preview}
      />

      <style>{`
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: #0f172a; }
        ::-webkit-scrollbar-thumb { background: #334155; border-radius: 3px; }
        input[type="file"] { color: #94a3b8; }
      `}</style>
    </div>
  );
}

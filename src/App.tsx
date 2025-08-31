import { Card, Settings, SystemAudio, Updater } from "./components";
import { Completion } from "./components/completion";
import { ChatHistory } from "./components/history";
import { AudioVisualizer } from "./components/speech/audio-visualizer";
import { useSystemAudio } from "./hooks/useSystemAudio";

const App = () => {
  const systemAudio = useSystemAudio();

  const handleSelectConversation = (conversation: any) => {
    // Use localStorage to communicate the selected conversation to Completion component
    localStorage.setItem("selectedConversation", JSON.stringify(conversation));
    // Trigger a custom event to notify Completion component
    window.dispatchEvent(
      new CustomEvent("conversationSelected", {
        detail: conversation,
      })
    );
  };

  const handleNewConversation = () => {
    // Clear any selected conversation and trigger new conversation
    localStorage.removeItem("selectedConversation");
    window.dispatchEvent(new CustomEvent("newConversation"));
  };

  return (
    <div className="w-screen h-screen flex overflow-hidden justify-center items-start">
      <Card className="w-full flex flex-row items-center gap-2 p-2">
        <SystemAudio {...systemAudio} />
        {systemAudio?.capturing ? (
          <AudioVisualizer isRecording={systemAudio?.capturing} />
        ) : null}

        <div
          className={`${
            systemAudio?.capturing
              ? "hidden w-full fade-out transition-all duration-300"
              : "w-full flex flex-row gap-2 items-center"
          }`}
        >
          <Completion />
          <ChatHistory
            onSelectConversation={handleSelectConversation}
            onNewConversation={handleNewConversation}
            currentConversationId={null}
          />
          <Settings />
        </div>

        <Updater />
      </Card>
    </div>
  );
};

export default App;

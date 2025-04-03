import React from 'react';
import { MessageSquare, Users, Send, PlusCircle } from 'lucide-react';

function CommunicationHub() {
  const channels = [
    { id: 1, name: 'Général', unread: 3 },
    { id: 2, name: 'Opérations', unread: 0 },
    { id: 3, name: 'Formation', unread: 1 },
  ];

  const messages = [
    {
      id: 1,
      author: 'Sarah Chen',
      content: 'Briefing de mission à 20h00.',
      time: '14:30',
    },
    {
      id: 2,
      author: 'Mike Johnson',
      content: 'Maintenance du Hammerhead terminée.',
      time: '14:15',
    },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-100 mb-8">Centre de Communication</h1>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Liste des canaux */}
        <div className="lg:col-span-1">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700 p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-100">Canaux</h2>
              <button className="text-gray-400 hover:text-red-500">
                <PlusCircle className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-2">
              {channels.map((channel) => (
                <button
                  key={channel.id}
                  className="w-full flex items-center justify-between p-2 rounded-md hover:bg-gray-700/50 transition-colors"
                >
                  <div className="flex items-center">
                    <MessageSquare className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-gray-300">{channel.name}</span>
                  </div>
                  {channel.unread > 0 && (
                    <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                      {channel.unread}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Zone de chat */}
        <div className="lg:col-span-3">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700 flex flex-col h-[600px]">
            {/* En-tête */}
            <div className="p-4 border-b border-gray-700 flex items-center justify-between">
              <div className="flex items-center">
                <h2 className="text-lg font-semibold text-gray-100">Général</h2>
                <span className="ml-2 text-sm text-gray-400">
                  <Users className="h-4 w-4 inline mr-1" />
                  24 membres
                </span>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div key={message.id} className="flex items-start">
                  <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-sm">
                    {message.author.charAt(0)}
                  </div>
                  <div className="ml-3">
                    <div className="flex items-baseline">
                      <span className="text-gray-300 font-medium">{message.author}</span>
                      <span className="ml-2 text-xs text-gray-500">{message.time}</span>
                    </div>
                    <p className="text-gray-400 mt-1">{message.content}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Zone de saisie */}
            <div className="p-4 border-t border-gray-700">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  placeholder="Votre message..."
                  className="flex-1 bg-gray-700 border border-gray-600 rounded-md px-4 py-2 text-gray-300 focus:outline-none focus:border-red-500"
                />
                <button className="p-2 text-gray-400 hover:text-red-500">
                  <Send className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CommunicationHub;
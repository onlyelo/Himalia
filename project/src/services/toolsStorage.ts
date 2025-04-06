import { compressToUTF16, decompressFromUTF16 } from 'lz-string';

export interface Tool {
  id: string;
  name: string;
  description: string;
  image: string;
  url: string;
  status: 'En ligne' | 'Hors ligne';
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY_PREFIX = 'himalia-tools';
const CHUNK_SIZE = 5; // Small chunk size since tools may have large images

export const toolsStorage = {
  getChunkKey(index: number): string {
    return `${STORAGE_KEY_PREFIX}-${index}`;
  },

  getTools(): Tool[] {
    try {
      let tools: Tool[] = [];
      let index = 0;
      
      while (true) {
        const chunk = localStorage.getItem(this.getChunkKey(index));
        if (!chunk) break;
        
        const decompressed = decompressFromUTF16(chunk);
        if (!decompressed) break;
        
        const parsedChunk = JSON.parse(decompressed);
        if (!Array.isArray(parsedChunk)) throw new Error('Invalid chunk format');
        
        tools = [...tools, ...parsedChunk];
        index++;
      }
      
      return tools;
    } catch (error) {
      console.error('Error loading tools:', error);
      return [];
    }
  },

  saveTools(tools: Tool[]): void {
    try {
      // Clear existing chunks
      let index = 0;
      while (localStorage.getItem(this.getChunkKey(index)) !== null) {
        localStorage.removeItem(this.getChunkKey(index));
        index++;
      }

      // Split tools into chunks and save
      for (let i = 0; i < tools.length; i += CHUNK_SIZE) {
        const chunk = tools.slice(i, i + CHUNK_SIZE);
        const compressed = compressToUTF16(JSON.stringify(chunk));
        const chunkIndex = Math.floor(i / CHUNK_SIZE);
        
        try {
          localStorage.setItem(this.getChunkKey(chunkIndex), compressed);
        } catch (e) {
          if (e.name === 'QuotaExceededError') {
            throw new Error('Storage space exceeded. Try reducing image sizes or removing unused tools.');
          }
          throw e;
        }
      }
    } catch (error) {
      console.error('Error saving tools:', error);
      throw new Error(`Failed to save tools: ${error.message}`);
    }
  },

  addTool(tool: Omit<Tool, 'id' | 'createdAt' | 'updatedAt'>): Tool {
    const tools = this.getTools();
    const newTool = {
      ...tool,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    this.saveTools([...tools, newTool]);
    return newTool;
  },

  updateTool(id: string, updates: Partial<Tool>): Tool {
    const tools = this.getTools();
    const index = tools.findIndex(t => t.id === id);
    if (index === -1) throw new Error('Tool not found');
    
    const updatedTool = {
      ...tools[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    
    tools[index] = updatedTool;
    this.saveTools(tools);
    return updatedTool;
  },

  deleteTool(id: string): void {
    const tools = this.getTools();
    const filtered = tools.filter(t => t.id !== id);
    this.saveTools(filtered);
  },
};
import { VMModel } from '../models/VM.js';
import logger from '../utils/logger.js';

// Re-export interface for compatibility, or define a compatible one
export interface VM {
  id: string;
  name: string;
  ip: string;
  username: string;
  password?: string;
  port: number;
  environmentId?: string;
}

export const vmService = {
  async getAll(environmentId?: string, search?: string): Promise<VM[]> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const query: any = {};
      
      if (environmentId) {
        query.environmentId = environmentId;
      }
      
      if (search) {
        // Use text search if possible, otherwise fallback to regex
        // Since we added a text index, we can try using $text
        // However, $text search is full-word based. Users often want partial match (e.g. "192.168").
        // For best UX with partial matches, we keep Regex but optimize if possible.
        // MongoDB regex on indexed fields is efficient if anchored (^prefix), but we want 'contains'.
        // 'contains' regex cannot use standard B-Tree index effectively for lookups, but we can't change that without changing requirements.
        // But we added text index - let's use it for relevance if the user types words.
        // Actually, for "speed" in partial search, regex is the only way in MongoDB without external search engines (Elastic/Algolia).
        // Let's stick to Regex but maybe ensure it's not blocking.
        // Optimally, we can check if the search term looks like a keyword and use $text, but $regex is safer for "substrings".
        
        // Let's optimize by not using $or on 3 fields if we can avoid it, but we need all 3.
        // The most important thing is limiting the result set if it's too large.
        
        const regex = new RegExp(search, 'i');
        query.$or = [
          { name: regex },
          { ip: regex },
          { username: regex }
        ];
      }

      // Limit results to avoid sending massive data for broad queries
      const vms = await VMModel.find(query).limit(20);
      
      return vms.map(v => {
        const obj = v.toObject();
        return {
          id: obj._id.toString(),
          name: obj.name,
          ip: obj.ip,
          username: obj.username,
          password: obj.password,
          port: obj.port,
          environmentId: obj.environmentId
        };
      });
    } catch (error) {
      logger.error('Error fetching VMs:', error);
      return [];
    }
  },

  async getById(id: string): Promise<VM | undefined> {
    try {
      const v = await VMModel.findById(id);
      if (!v) return undefined;
      const obj = v.toObject();
      return {
          id: obj._id.toString(),
          name: obj.name,
          ip: obj.ip,
          username: obj.username,
          password: obj.password,
          port: obj.port,
          environmentId: obj.environmentId
      };
    } catch (error) {
      logger.error('Error fetching VM:', error);
      return undefined;
    }
  },

  async add(vmData: Omit<VM, 'id'>): Promise<VM> {
    const newVM = new VMModel({
      ...vmData,
      port: vmData.port || 22,
    });
    await newVM.save();
    
    const obj = newVM.toObject();
    return {
      id: obj._id.toString(),
      name: obj.name,
      ip: obj.ip,
      username: obj.username,
      password: obj.password,
      port: obj.port,
      environmentId: obj.environmentId
    };
  },

  async update(id: string, vmData: Partial<VM>): Promise<VM | null> {
    const updated = await VMModel.findByIdAndUpdate(id, vmData, { new: true });
    if (!updated) return null;
    
    const obj = updated.toObject();
    return {
      id: obj._id.toString(),
      name: obj.name,
      ip: obj.ip,
      username: obj.username,
      password: obj.password,
      port: obj.port,
      environmentId: obj.environmentId
    };
  },

  async delete(id: string): Promise<boolean> {
    const result = await VMModel.findByIdAndDelete(id);
    return !!result;
  },
};

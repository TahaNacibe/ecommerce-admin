import PropertyType from "./property_type";

interface Category {
    _id: string;
    name: string;
    description?: string;
    parent?: string;
    parentFor?: number;
    usedCount: number;
    properties?: [
        { 
          key: { type: String, required: true },  // Property key (e.g., 'color', 'size')
          values: [{ type: String, required: true }]  // Property value (e.g., 'red', 'M')
        }
      ] 
}
  
export default Category
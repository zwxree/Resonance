
import React, { useState, useRef } from 'react';
import { UploadCloud, Wand2, Loader2, Image as ImageIcon } from 'lucide-react';
import { editImageWithNanoBanana } from '../services/geminiService';

const fileToGenerativePart = async (file: File) => {
    const base64EncodedDataPromise = new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
      reader.readAsDataURL(file);
    });
    return {
      mimeType: file.type,
      base64: await base64EncodedDataPromise
    };
};

export default function ImageEditor() {
    const [image, setImage] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [editedImageUrl, setEditedImageUrl] = useState<string | null>(null);
    const [prompt, setPrompt] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImage(file);
            setPreviewUrl(URL.createObjectURL(file));
            setEditedImageUrl(null);
            setError(null);
        }
    };
    
    const handleEditImage = async () => {
        if (!image || !prompt) {
            setError('Please upload an image and provide an editing prompt.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setEditedImageUrl(null);
        
        try {
            const { base64, mimeType } = await fileToGenerativePart(image);
            const resultBase64 = await editImageWithNanoBanana(prompt, base64, mimeType);
            
            if (resultBase64) {
                setEditedImageUrl(`data:${mimeType};base64,${resultBase64}`);
            } else {
                setError('Failed to edit the image. Please try again.');
            }
        } catch (e) {
            console.error(e);
            setError('An unexpected error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-2">AI Image Editor</h1>
            <p className="text-resonance-gray-500 mb-8">Edit images with text prompts using Gemini.</p>

            <div className="space-y-6">
                <div 
                    className="relative border-2 border-dashed border-resonance-gray-600 rounded-2xl flex flex-col justify-center items-center h-64 text-center cursor-pointer hover:border-electric-blue-500 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                >
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                    {previewUrl ? (
                        <img src={previewUrl} alt="Preview" className="w-full h-full object-contain rounded-2xl p-2" />
                    ) : (
                        <>
                            <UploadCloud className="text-resonance-gray-500" size={48} />
                            <p className="mt-2 text-white">Click to upload an image</p>
                            <p className="text-sm text-resonance-gray-500">PNG, JPG, WEBP</p>
                        </>
                    )}
                </div>

                {image && (
                     <div className="flex flex-col space-y-4">
                        <input
                            type="text"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="e.g., 'Add a retro filter'"
                            className="w-full bg-resonance-gray-800 p-3 text-white placeholder-resonance-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-electric-blue-500"
                            disabled={isLoading}
                        />
                        <button
                            onClick={handleEditImage}
                            disabled={isLoading || !prompt}
                            className="w-full bg-electric-blue-500 text-white font-bold py-3 rounded-lg hover:bg-electric-blue-600 transition-colors flex items-center justify-center disabled:bg-resonance-gray-700 disabled:cursor-not-allowed"
                        >
                            {isLoading ? <Loader2 className="animate-spin" size={24} /> : <Wand2 className="mr-2" size={20} />}
                            {isLoading ? 'Generating...' : 'Apply Edit'}
                        </button>
                    </div>
                )}
                
                {error && <p className="text-red-500 text-center">{error}</p>}

                {(isLoading || editedImageUrl) && (
                    <div>
                        <h2 className="text-xl font-bold text-white mb-4">Result</h2>
                        <div className="border-2 border-resonance-gray-700 rounded-2xl flex justify-center items-center h-64 bg-resonance-gray-800">
                             {isLoading ? (
                                <Loader2 className="animate-spin text-electric-blue-500" size={48} />
                            ) : editedImageUrl ? (
                                <img src={editedImageUrl} alt="Edited result" className="w-full h-full object-contain rounded-2xl p-2" />
                            ) : (
                               <div className="text-center text-resonance-gray-500">
                                   <ImageIcon size={48}/>
                                   <p>Your edited image will appear here</p>
                               </div>
                            )}
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}

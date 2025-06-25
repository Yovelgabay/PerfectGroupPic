import React from "react";
import { X, MessageCircle, Mail, Copy, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";

export default function ShareOptions({ session, onClose }) {
  const handleShare = (platform) => {
    const shareText = `Check out our perfect group photo created with PerfectGroupPic AI!`;
    const shareUrl = session.final_photo_url;

    switch (platform) {
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`);
        break;
      case 'email':
        window.open(`mailto:?subject=Perfect Group Photo&body=${encodeURIComponent(shareText + '\n\n' + shareUrl)}`);
        break;
      case 'copy':
        navigator.clipboard.writeText(shareUrl);
        alert('Link copied to clipboard!');
        break;
      default:
        break;
    }
    onClose();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end justify-center"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: 300 }}
          animate={{ y: 0 }}
          exit={{ y: 300 }}
          className="bg-white rounded-t-3xl p-6 w-full max-w-md"
          onClick={(e) => e.stopPropagation()}
        >
          <Card className="border-0 shadow-none">
            <CardHeader className="text-center pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Share Perfect Photo</CardTitle>
                <Button onClick={onClose} size="icon" variant="ghost" className="rounded-full">
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-sm text-gray-600">Share your masterpiece with family and friends</p>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                onClick={() => handleShare('whatsapp')}
                className="w-full bg-green-500 hover:bg-green-600 text-white rounded-xl py-3"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Share on WhatsApp
              </Button>
              
              <Button
                onClick={() => handleShare('email')}
                variant="outline"
                className="w-full border-2 border-gray-200 rounded-xl py-3"
              >
                <Mail className="w-4 h-4 mr-2" />
                Send via Email
              </Button>
              
              <Button
                onClick={() => handleShare('copy')}
                variant="outline"
                className="w-full border-2 border-gray-200 rounded-xl py-3"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy Link
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
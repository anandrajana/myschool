const extractMentionedEmails = (text: string): string[] => {
    const emailPattern = /@([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;
    const mentionedEmails = [];
    let match;
    while ((match = emailPattern.exec(text)) !== null) {
        mentionedEmails.push(match[1]);
    }
    return mentionedEmails;
};

export default {
    extractMentionedEmails,
};

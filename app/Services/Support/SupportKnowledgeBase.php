<?php

namespace App\Services\Support;

use Illuminate\Support\Str;

class SupportKnowledgeBase
{
    /**
     * Public, curated answers for common product questions. Keeping these in
     * code means the support page can answer them without an AI request.
     *
     * @return array<int, array{question: string, answer: string, phrases: array<int, string>}>
     */
    public function entries(): array
    {
        return [
            [
                'question' => 'How do I start a TikTok search?',
                'answer' => 'From the homepage, choose whether you are researching a brand or product, enter one subject, then select any supporting keywords that make the search more relevant. Continue with Google or create an account to run the search.',
                'phrases' => ['how do i start a search', 'how to start a search', 'start a tiktok search', 'run a search'],
            ],
            [
                'question' => 'What is a saved search?',
                'answer' => 'A saved search is a repeatable TikTok discovery workflow for one brand, product, or phrase. It keeps the selected context and can refresh over time so you can return to the same research topic.',
                'phrases' => ['what is a saved search', 'how do saved searches work', 'saved search'],
            ],
            [
                'question' => 'What does Breakout Score mean?',
                'answer' => 'Breakout Score helps surface videos that outperform a creator\'s typical baseline. It is designed to highlight unusual momentum, not simply videos from the accounts with the most followers.',
                'phrases' => ['what is breakout score', 'breakout score', 'what does breakout mean'],
            ],
            [
                'question' => 'How do bookmarks work?',
                'answer' => 'Bookmarks let you save videos and saved searches for later review. Available bookmark capacity depends on your plan, so check the Plans or Subscription page for your current limits.',
                'phrases' => ['how do bookmarks work', 'how to bookmark', 'bookmark videos', 'save a video'],
            ],
            [
                'question' => 'What does video analysis include?',
                'answer' => 'Video analysis provides an AI-assisted read of an eligible video, including why it may have performed well, the opening hook, content drivers, and alternate hook ideas. Availability and usage limits depend on your plan.',
                'phrases' => ['what is video analysis', 'what does video analysis include', 'how does video analysis work', 'analyze a video'],
            ],
            [
                'question' => 'How does the free search work?',
                'answer' => 'You can begin one free search for a brand or product. After you choose the subject and supporting keywords, create an account or continue with Google so Brand Beacon can deliver the result to you.',
                'phrases' => ['how does free search work', 'free search', 'is there a free search'],
            ],
            [
                'question' => 'How do plans and trials work?',
                'answer' => 'Plans determine access to features and usage limits such as searches, bookmarks, and video analysis. Eligible accounts can start an 8-day trial; review the Plans page for the currently available plan details and pricing.',
                'phrases' => ['how do plans work', 'how does the trial work', 'plans and trials', '8 day trial', 'pricing plans'],
            ],
            [
                'question' => 'Why is my search still running?',
                'answer' => 'A search gathers TikTok videos, filters them against your selected context, scores likely outliers, and prepares the results. Most searches finish in around five minutes, though some can take up to twenty minutes.',
                'phrases' => ['why is my search running', 'search still running', 'how long does a search take', 'search taking too long'],
            ],
            [
                'question' => 'How do I contact the Brand Beacon team?',
                'answer' => 'For account-specific help, billing, security concerns, or anything not covered here, use the Contact page to send the Brand Beacon team a message.',
                'phrases' => ['how do i contact support', 'contact the team', 'contact brand beacon', 'talk to support'],
            ],
        ];
    }

    /** @return array{question: string, answer: string, phrases: array<int, string>}|null */
    public function match(string $question): ?array
    {
        $normalized = $this->normalize($question);

        if ($normalized === '') {
            return null;
        }

        foreach ($this->entries() as $entry) {
            foreach ([$entry['question'], ...$entry['phrases']] as $phrase) {
                if ($normalized === $this->normalize($phrase)) {
                    return $entry;
                }
            }
        }

        return null;
    }

    private function normalize(string $value): string
    {
        return trim((string) preg_replace('/\s+/', ' ', Str::of($value)->lower()->replaceMatches('/[^a-z0-9]+/', ' ')->toString()));
    }
}

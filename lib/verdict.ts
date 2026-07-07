export type Sentiment = "Positive" | "Neutral" | "Negative" | "N/A";
export type Recommendation = "Buy" | "Hold" | "Sell" | "N/A";

export function extractVerdict(analysis: string): {
  sentiment: Sentiment;
  recommendation: Recommendation;
} {
  const sentimentMatch = analysis.match(/sentiment.*?(Positive|Neutral|Negative)/is);
  const recommendationMatch = analysis.match(/recommend.*?(Buy|Hold|Sell)/is);

  return {
    sentiment: (sentimentMatch?.[1] as Sentiment) ?? "N/A",
    recommendation: (recommendationMatch?.[1] as Recommendation) ?? "N/A",
  };
}

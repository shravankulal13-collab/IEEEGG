// ============================================================
// PRIMARY OWNER: Shreevarsha V Hegde
// ROLE: Hospital + Dispatch Operations
// MODULE: Route Suitability Scoring
// ============================================================

export class RouteScorer {
  public static evaluateRoute(routes: any[]): any {
    // Selects the route with the best balance of distance and real-time traffic delay
    return routes.reduce((best, current) => {
      const currentScore = current.distance * 0.4 + current.durationInTraffic * 0.6;
      const bestScore = best.distance * 0.4 + best.durationInTraffic * 0.6;
      return currentScore < bestScore ? current : best;
    });
  }
}
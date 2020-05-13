declare namespace fathom {

    function beacon(params)
    function blockTrackingForMe(confirm: boolean): void
    function enableTrackingForMe()
    function send(params)
    function trackDynamicGoal(goal, cents)
    function trackGoal(code: string, cents: number): void
    function trackPageview(params)
}
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Check, ExternalLink, Sparkles, Building2, Crown, Zap } from "lucide-react";

interface Subscription {
  tier: 'free' | 'pro' | 'business' | 'enterprise';
  status: string;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  startDate?: string;
  endDate?: string;
  canceledAt?: string;
}

export default function BillingSettings() {
  const { toast } = useToast();

  // Fetch current subscription
  const { data: subscription, isLoading, refetch } = useQuery<Subscription>({
    queryKey: ['subscription'],
    queryFn: async () => {
      const res = await fetch('/api/subscription', {
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to fetch subscription');
      return res.json();
    },
  });

  // Open Stripe customer portal
  const portalMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/subscription/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          returnUrl: window.location.href,
        }),
      });
      if (!res.ok) throw new Error('Failed to create portal session');
      const data = await res.json();
      return data.url;
    },
    onSuccess: (url) => {
      window.location.href = url;
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to open billing portal',
        variant: 'destructive',
      });
    },
  });

  const getTierInfo = (tier: string) => {
    switch (tier) {
      case 'free':
        return {
          name: 'Free',
          icon: Sparkles,
          color: 'bg-muted text-muted-foreground',
          description: 'Open source, self-hosted',
        };
      case 'pro':
        return {
          name: 'Pro',
          icon: Zap,
          color: 'bg-primary text-primary-foreground',
          description: 'Priority support & early access',
        };
      case 'business':
        return {
          name: 'Business',
          icon: Building2,
          color: 'bg-accent text-accent-foreground',
          description: 'White-label & SLA',
        };
      case 'enterprise':
        return {
          name: 'Enterprise',
          icon: Crown,
          color: 'bg-gradient-to-r from-primary to-accent text-white',
          description: 'Dedicated support & custom development',
        };
      default:
        return {
          name: 'Unknown',
          icon: Sparkles,
          color: 'bg-muted',
          description: '',
        };
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </CardContent>
      </Card>
    );
  }

  const tierInfo = getTierInfo(subscription?.tier || 'free');
  const TierIcon = tierInfo.icon;

  return (
    <div className="space-y-6">
      {/* Current Plan */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TierIcon className="w-5 h-5" />
            Your Subscription
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Tier Badge */}
          <div className="flex items-center gap-4">
            <Badge className={`${tierInfo.color} text-lg px-4 py-2`}>
              {tierInfo.name} Tier
            </Badge>
            <div>
              <p className="font-medium">{tierInfo.description}</p>
              {subscription?.status && subscription.status !== 'active' && (
                <p className="text-sm text-destructive mt-1">
                  Status: {subscription.status}
                </p>
              )}
            </div>
          </div>

          {/* Subscription Details */}
          {subscription?.tier !== 'free' && subscription?.stripeSubscriptionId && (
            <div className="space-y-2 text-sm">
              {subscription.startDate && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Started:</span>
                  <span>{new Date(subscription.startDate).toLocaleDateString()}</span>
                </div>
              )}
              {subscription.endDate && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Renews:</span>
                  <span>{new Date(subscription.endDate).toLocaleDateString()}</span>
                </div>
              )}
              {subscription.canceledAt && (
                <div className="flex justify-between">
                  <span className="text-destructive">Canceled:</span>
                  <span>{new Date(subscription.canceledAt).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
            {subscription?.tier === 'free' ? (
              <a href="https://ameoba.org/pricing" target="_blank" rel="noopener noreferrer">
                <Button variant="default">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Upgrade to Pro ($29/mo)
                </Button>
              </a>
            ) : (
              <Button
                onClick={() => portalMutation.mutate()}
                disabled={portalMutation.isPending}
                variant="outline"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                {portalMutation.isPending ? 'Opening...' : 'Manage Subscription'}
              </Button>
            )}
            
            <a href="https://ameoba.org/pricing" target="_blank" rel="noopener noreferrer">
              <Button variant="ghost">
                View All Plans
              </Button>
            </a>
          </div>
        </CardContent>
      </Card>

      {/* Features by Tier */}
      <Card>
        <CardHeader>
          <CardTitle>Your Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Free Features (Everyone gets these) */}
            <div>
              <p className="font-medium mb-2">✅ Included in Your Plan:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Check className="w-4 h-4 text-primary" />
                  <span>AI content generation</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Check className="w-4 h-4 text-primary" />
                  <span>Multi-channel delivery</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Check className="w-4 h-4 text-primary" />
                  <span>SMS commands</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Check className="w-4 h-4 text-primary" />
                  <span>Scheduled automation</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Check className="w-4 h-4 text-primary" />
                  <span>Review workflow</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Check className="w-4 h-4 text-primary" />
                  <span>All delivery channels</span>
                </div>
              </div>
            </div>

            {/* Pro Features */}
            {(subscription?.tier === 'pro' || subscription?.tier === 'business' || subscription?.tier === 'enterprise') && (
              <div>
                <p className="font-medium mb-2 text-primary">✨ Pro Features:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="w-4 h-4 text-primary" />
                    <span>Priority email support</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="w-4 h-4 text-primary" />
                    <span>Early access to features</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="w-4 h-4 text-primary" />
                    <span>Private Discord server</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="w-4 h-4 text-primary" />
                    <span>Roadmap voting</span>
                  </div>
                </div>
              </div>
            )}

            {/* Business Features */}
            {(subscription?.tier === 'business' || subscription?.tier === 'enterprise') && (
              <div>
                <p className="font-medium mb-2 text-accent">🏢 Business Features:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="w-4 h-4 text-accent" />
                    <span>White-label (no branding)</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="w-4 h-4 text-accent" />
                    <span>SLA (4-hour response)</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="w-4 h-4 text-accent" />
                    <span>Multi-instance support</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="w-4 h-4 text-accent" />
                    <span>Priority bug fixes</span>
                  </div>
                </div>
              </div>
            )}

            {/* Upgrade CTA for Free Users */}
            {subscription?.tier === 'free' && (
              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground mb-3">
                  Want priority support and early access to new features?
                </p>
                <a href="https://ameoba.org/pricing" target="_blank" rel="noopener noreferrer">
                  <Button variant="default" size="sm">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Upgrade to Pro ($29/month)
                  </Button>
                </a>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Support Info */}
      <Card>
        <CardHeader>
          <CardTitle>Get Help</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {subscription?.tier === 'free' ? (
            <div>
              <p className="text-sm text-muted-foreground mb-2">
                <strong>Community Support</strong>
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                Get help from the community via GitHub Issues and Discord.
              </p>
              <div className="flex gap-2">
                <a href="https://github.com/quarkvibe/ameoba_v2.0/issues" target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="sm">
                    GitHub Issues
                  </Button>
                </a>
                <a href="https://discord.gg/amoeba" target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="sm">
                    Community Discord
                  </Button>
                </a>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-sm text-muted-foreground mb-2">
                <strong>Priority Support</strong>
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                Email us for priority support with {subscription?.tier === 'business' ? '4-hour' : '24-hour'} response time.
              </p>
              <div className="flex gap-2">
                <a href="mailto:support@quarkvibe.com">
                  <Button variant="default" size="sm">
                    Email Support
                  </Button>
                </a>
                <a href="https://discord.gg/amoeba-pro" target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="sm">
                    Private Discord
                  </Button>
                </a>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


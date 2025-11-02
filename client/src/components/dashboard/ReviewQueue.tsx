import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';

/**
 * Review Queue Component
 * Allows users to review, approve, or reject AI-generated content
 * before it's delivered
 */

interface ReviewItem {
  id: string;
  contentId: string;
  templateName: string;
  status: 'pending' | 'approved' | 'rejected' | 'needs_revision';
  original: string;
  processed: string;
  metadata: {
    qualityScore?: number;
    safetyFlags?: string[];
    validationErrors?: string[];
    wordCount?: number;
    processingTime?: number;
  };
  submittedAt: string;
  reviewedAt?: string;
  reviewNotes?: string;
}

export default function ReviewQueue() {
  const { toast } = useToast();
  const [pendingReviews, setPendingReviews] = useState<ReviewItem[]>([]);
  const [allReviews, setAllReviews] = useState<ReviewItem[]>([]);
  const [selectedReview, setSelectedReview] = useState<ReviewItem | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [showDiff, setShowDiff] = useState(false);
  
  useEffect(() => {
    fetchPendingReviews();
    fetchAllReviews();
    fetchStats();
  }, []);
  
  const fetchPendingReviews = async () => {
    try {
      const response = await fetch('/api/reviews/pending');
      const data = await response.json();
      if (data.success) {
        setPendingReviews(data.reviews);
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to load pending reviews',
        variant: 'destructive',
      });
    }
  };
  
  const fetchAllReviews = async () => {
    try {
      const response = await fetch('/api/reviews');
      const data = await response.json();
      if (data.success) {
        setAllReviews(data.reviews);
      }
    } catch (error: any) {
      console.error('Failed to load all reviews:', error);
    }
  };
  
  const fetchStats = async () => {
    try {
      const response = await fetch('/api/reviews/stats');
      const data = await response.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error: any) {
      console.error('Failed to load stats:', error);
    }
  };
  
  const handleApprove = async (reviewId: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/reviews/${reviewId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: reviewNotes }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: 'Approved',
          description: 'Content approved and queued for delivery',
        });
        
        fetchPendingReviews();
        fetchAllReviews();
        fetchStats();
        setSelectedReview(null);
        setReviewNotes('');
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to approve content',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleReject = async (reviewId: string) => {
    if (!reviewNotes.trim()) {
      toast({
        title: 'Error',
        description: 'Please provide a rejection reason',
        variant: 'destructive',
      });
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch(`/api/reviews/${reviewId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: reviewNotes }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: 'Rejected',
          description: 'Content has been rejected',
        });
        
        fetchPendingReviews();
        fetchAllReviews();
        fetchStats();
        setSelectedReview(null);
        setReviewNotes('');
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to reject content',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleRequestRevision = async (reviewId: string) => {
    if (!reviewNotes.trim()) {
      toast({
        title: 'Error',
        description: 'Please provide revision feedback',
        variant: 'destructive',
      });
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch(`/api/reviews/${reviewId}/revise`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedback: reviewNotes }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: 'Revision Requested',
          description: 'Content marked for revision',
        });
        
        fetchPendingReviews();
        fetchAllReviews();
        setSelectedReview(null);
        setReviewNotes('');
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to request revision',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  
  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      pending: 'default',
      approved: 'success',
      rejected: 'destructive',
      needs_revision: 'warning',
    };
    
    return <Badge variant={variants[status] || 'default'}>{status.replace('_', ' ')}</Badge>;
  };
  
  const getQualityColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };
  
  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Review Queue</h2>
          <p className="text-sm text-muted-foreground">
            Approve or reject AI-generated content before delivery
          </p>
        </div>
        
        {stats && (
          <div className="flex gap-4 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{stats.totalPending}</div>
              <div className="text-muted-foreground">Pending</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.totalApproved}</div>
              <div className="text-muted-foreground">Approved</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{stats.totalRejected}</div>
              <div className="text-muted-foreground">Rejected</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{stats.avgQualityScore}</div>
              <div className="text-muted-foreground">Avg Quality</div>
            </div>
          </div>
        )}
      </div>
      
      <Tabs defaultValue="pending" className="w-full">
        <TabsList>
          <TabsTrigger value="pending">
            Pending ({pendingReviews.length})
          </TabsTrigger>
          <TabsTrigger value="all">
            All Reviews ({allReviews.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="pending" className="mt-6">
          {pendingReviews.length === 0 ? (
            <Card className="p-12 text-center">
              <div className="text-muted-foreground">
                <div className="text-4xl mb-4">✅</div>
                <div className="text-lg font-medium">No pending reviews</div>
                <div className="text-sm">All content has been reviewed!</div>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Review List */}
              <div className="lg:col-span-1 space-y-3">
                <ScrollArea className="h-[600px]">
                  {pendingReviews.map((review) => (
                    <Card
                      key={review.id}
                      className={`p-4 mb-3 cursor-pointer transition-colors ${
                        selectedReview?.id === review.id
                          ? 'border-primary bg-accent'
                          : 'hover:bg-accent'
                      }`}
                      onClick={() => {
                        setSelectedReview(review);
                        setReviewNotes('');
                        setShowDiff(false);
                      }}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="font-medium truncate">{review.templateName}</div>
                        {getStatusBadge(review.status)}
                      </div>
                      
                      <div className="text-xs text-muted-foreground mb-2">
                        {new Date(review.submittedAt).toLocaleString()}
                      </div>
                      
                      {review.metadata?.qualityScore !== undefined && (
                        <div className="flex items-center gap-2">
                          <div className="text-xs text-muted-foreground">Quality:</div>
                          <div className={`text-sm font-bold ${getQualityColor(review.metadata.qualityScore)}`}>
                            {review.metadata.qualityScore}/100
                          </div>
                        </div>
                      )}
                      
                      {review.metadata?.safetyFlags && review.metadata.safetyFlags.length > 0 && (
                        <div className="mt-2">
                          <Badge variant="destructive" className="text-xs">
                            {review.metadata.safetyFlags.length} safety flag(s)
                          </Badge>
                        </div>
                      )}
                    </Card>
                  ))}
                </ScrollArea>
              </div>
              
              {/* Review Detail */}
              <div className="lg:col-span-2">
                {selectedReview ? (
                  <Card className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold">{selectedReview.templateName}</h3>
                      {getStatusBadge(selectedReview.status)}
                    </div>
                    
                    {/* Quality Metrics */}
                    {selectedReview.metadata && (
                      <div className="mb-6 p-4 bg-muted rounded-lg">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          {selectedReview.metadata.qualityScore !== undefined && (
                            <div>
                              <div className="text-muted-foreground">Quality Score</div>
                              <div className={`text-2xl font-bold ${getQualityColor(selectedReview.metadata.qualityScore)}`}>
                                {selectedReview.metadata.qualityScore}/100
                              </div>
                            </div>
                          )}
                          
                          {selectedReview.metadata.wordCount && (
                            <div>
                              <div className="text-muted-foreground">Word Count</div>
                              <div className="text-2xl font-bold">{selectedReview.metadata.wordCount}</div>
                            </div>
                          )}
                          
                          {selectedReview.metadata.processingTime && (
                            <div>
                              <div className="text-muted-foreground">Processing</div>
                              <div className="text-2xl font-bold">{selectedReview.metadata.processingTime}ms</div>
                            </div>
                          )}
                          
                          {selectedReview.metadata.safetyFlags && selectedReview.metadata.safetyFlags.length > 0 && (
                            <div>
                              <div className="text-muted-foreground">Safety Flags</div>
                              <div className="text-2xl font-bold text-red-600">
                                {selectedReview.metadata.safetyFlags.length}
                              </div>
                            </div>
                          )}
                        </div>
                        
                        {selectedReview.metadata.safetyFlags && selectedReview.metadata.safetyFlags.length > 0 && (
                          <div className="mt-4 text-sm">
                            <div className="font-medium mb-2">Safety Issues:</div>
                            <div className="flex flex-wrap gap-2">
                              {selectedReview.metadata.safetyFlags.map((flag: string, i: number) => (
                                <Badge key={i} variant="destructive">{flag}</Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Content Preview */}
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">Generated Content</h4>
                        {selectedReview.processed !== selectedReview.original && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowDiff(!showDiff)}
                          >
                            {showDiff ? 'Hide' : 'Show'} Original
                          </Button>
                        )}
                      </div>
                      
                      <ScrollArea className="h-[300px]">
                        <pre className="whitespace-pre-wrap bg-muted p-4 rounded text-sm">
                          {selectedReview.processed}
                        </pre>
                      </ScrollArea>
                      
                      {showDiff && selectedReview.processed !== selectedReview.original && (
                        <div className="mt-4">
                          <h4 className="font-medium mb-2">Original (Before Processing)</h4>
                          <ScrollArea className="h-[200px]">
                            <pre className="whitespace-pre-wrap bg-muted/50 p-4 rounded text-sm">
                              {selectedReview.original}
                            </pre>
                          </ScrollArea>
                        </div>
                      )}
                    </div>
                    
                    {/* Review Actions */}
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">Review Notes (Optional)</label>
                        <Textarea
                          placeholder="Add notes about this review..."
                          value={reviewNotes}
                          onChange={(e) => setReviewNotes(e.target.value)}
                          rows={3}
                        />
                      </div>
                      
                      <div className="flex gap-3">
                        <Button
                          onClick={() => handleApprove(selectedReview.id)}
                          disabled={loading}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          ✓ Approve & Deliver
                        </Button>
                        
                        <Button
                          variant="outline"
                          onClick={() => handleReject(selectedReview.id)}
                          disabled={loading}
                        >
                          ✗ Reject
                        </Button>
                        
                        <Button
                          variant="outline"
                          onClick={() => handleRequestRevision(selectedReview.id)}
                          disabled={loading}
                        >
                          🔄 Request Revision
                        </Button>
                      </div>
                    </div>
                  </Card>
                ) : (
                  <Card className="p-12 text-center text-muted-foreground">
                    <div className="text-4xl mb-4">👈</div>
                    <div>Select a review from the list</div>
                  </Card>
                )}
              </div>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="all" className="mt-6">
          <Card className="p-6">
            <div className="space-y-3">
              {allReviews.map((review) => (
                <div
                  key={review.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent cursor-pointer"
                  onClick={() => setSelectedReview(review)}
                >
                  <div className="flex-1">
                    <div className="font-medium">{review.templateName}</div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(review.submittedAt).toLocaleString()}
                    </div>
                  </div>
                  
                  {review.metadata?.qualityScore && (
                    <div className={`text-sm font-bold mr-4 ${getQualityColor(review.metadata.qualityScore)}`}>
                      {review.metadata.qualityScore}/100
                    </div>
                  )}
                  
                  {getStatusBadge(review.status)}
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}


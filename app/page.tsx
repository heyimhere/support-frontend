import React from 'react';
import { Card, CardContent } from './components/ui/card';
import { Button } from './components/ui/button';
import { Badge } from './components/ui/badge';
import { 
  MessageSquare, 
  Settings, 
  Bot, 
  Users, 
  ArrowRight,
  CheckCircle,
  Clock,
  Shield,
  Zap,
  Star,
} from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  const features = [
    {
      icon: Bot,
      title: 'AI-Powered Assistant',
      description: 'Smart conversation flow that guides users through ticket creation',
      color: 'text-blue-600 bg-blue-50',
    },
    {
      icon: MessageSquare,
      title: 'Interactive Chat',
      description: 'Natural conversation interface with typing indicators and suggestions',
      color: 'text-green-600 bg-green-50',
    },
    {
      icon: Users,
      title: 'Support Dashboard',
      description: 'Comprehensive ticket management with filtering and statistics',
      color: 'text-purple-600 bg-purple-50',
    },
    {
      icon: Zap,
      title: 'Real-time Updates',
      description: 'Live ticket status updates and instant notifications',
      color: 'text-orange-600 bg-orange-50',
    },
  ];

  const stats = [
    { label: 'Average Response Time', value: '< 2 hours', icon: Clock },
    { label: 'Customer Satisfaction', value: '98%', icon: Star },
    { label: 'Tickets Resolved', value: '24/7', icon: CheckCircle },
    { label: 'Security Level', value: 'Enterprise', icon: Shield },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <MessageSquare className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Support System</h1>
                <p className="text-sm text-muted-foreground">
                  AI-powered customer support platform
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link href="/support">
                <Button variant="outline" size="sm" className="gap-2">
                  <Settings className="h-4 w-4" />
                  Dashboard
                </Button>
              </Link>
              <Link href="/chat">
                <Button size="sm" className="gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Get Support
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-12">
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4">
            <Zap className="h-3 w-3 mr-1" />
            Powered by AI
          </Badge>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Customer Support
            <br />
            Made Simple
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Experience intelligent support with our AI assistant that guides you through creating 
            tickets and helps our team resolve your issues faster.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/chat">
              <Button size="lg" className="gap-2 text-lg px-8 py-6">
                <Bot className="h-5 w-5" />
                Start Support Chat
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            
            <Link href="/support">
              <Button variant="outline" size="lg" className="gap-2 text-lg px-8 py-6">
                <Users className="h-5 w-5" />
                Support Dashboard
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="text-center hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-center mb-3">
                    <div className="p-3 bg-primary/10 rounded-full">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold mb-1">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Features Section */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Everything you need for great support</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Our platform combines the best of AI and human support to deliver exceptional customer experiences.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="hover:shadow-lg transition-all duration-200 border-0 shadow-md">
                  <CardContent className="p-8">
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-full ${feature.color}`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                        <p className="text-muted-foreground">{feature.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* How it Works Section */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">How it works</h2>
            <p className="text-muted-foreground text-lg">Simple steps to get the help you need</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Start a Conversation</h3>
              <p className="text-muted-foreground">
                                 Click &quot;Start Support Chat&quot; and begin talking with our AI assistant
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-green-600">2</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Describe Your Issue</h3>
              <p className="text-muted-foreground">
                Our AI will guide you through questions to understand your problem
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-purple-600">3</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Get Help</h3>
              <p className="text-muted-foreground">
                Your ticket is created and our support team will assist you
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0">
          <CardContent className="p-12 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
            <p className="text-blue-100 mb-8 text-lg">
              Join thousands of customers who trust our support platform
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/chat">
                <Button size="lg" variant="secondary" className="gap-2 text-lg px-8 py-6">
                  <Bot className="h-5 w-5" />
                  Start Your First Chat
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              
              <Link href="/support">
                <Button size="lg" variant="outline" className="gap-2 text-lg px-8 py-6 bg-transparent border-white text-white hover:bg-white hover:text-blue-600">
                  <Settings className="h-5 w-5" />
                  Explore Dashboard
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white/50 backdrop-blur-sm mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <MessageSquare className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold">Support System</h3>
                  <p className="text-sm text-muted-foreground">AI-powered support platform</p>
                </div>
              </div>
              <p className="text-muted-foreground mb-4">
                Delivering exceptional customer support through intelligent automation 
                and human expertise.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <div className="space-y-2 text-sm">
                <Link href="/chat" className="block text-muted-foreground hover:text-foreground transition-colors">
                  Start Chat
                </Link>
                <Link href="/support" className="block text-muted-foreground hover:text-foreground transition-colors">
                  Dashboard
                </Link>
                <a href="#" className="block text-muted-foreground hover:text-foreground transition-colors">
                  Documentation
                </a>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <div className="space-y-2 text-sm">
                <a href="#" className="block text-muted-foreground hover:text-foreground transition-colors">
                  Help Center
                </a>
                <a href="#" className="block text-muted-foreground hover:text-foreground transition-colors">
                  Contact Us
                </a>
                <a href="#" className="block text-muted-foreground hover:text-foreground transition-colors">
                  Status Page
                </a>
              </div>
            </div>
          </div>

          <div className="border-t mt-8 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <div>
              © 2025 Support System. All rights reserved.
            </div>
            <div className="flex items-center gap-6">
              <a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-foreground transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-foreground transition-colors">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

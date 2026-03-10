import { useState, useEffect, useRef } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import SEO from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { PARTNER_TIERS, isPartnerTier, type PartnerTierKey } from "@/config/partners";
import {
  CheckCircle,
  Upload,
  User,
  Building2,
  Users,
  Share2,
  Rocket,
  Smartphone,
  Mic,
  CalendarDays,
  Image,
  Loader2,
  PartyPopper,
  MonitorPlay,
  Presentation,
  FileVideo,
  X,
} from "lucide-react";

interface Attendee {
  name: string;
  email: string;
}

const IOS_APP_LINK = "https://apps.apple.com/us/app/formula-forum/id6759879318";
const HOTEL_BOOK_URL = "https://book.passkey.com/event/51189838/owner/49980248/home";

const PartnerWelcome = () => {
  const { tier: tierParam } = useParams<{ tier: string }>();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const tier = (tierParam?.toLowerCase() || "bronze") as PartnerTierKey;
  const tierConfig = isPartnerTier(tier) ? PARTNER_TIERS[tier] : null;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [existingId, setExistingId] = useState<string | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [videoLoopFile, setVideoLoopFile] = useState<File | null>(null);
  const [videoLoopUrl, setVideoLoopUrl] = useState<string | null>(null);
  const [stageFiles, setStageFiles] = useState<File[]>([]);
  const [stageFileUrls, setStageFileUrls] = useState<string[]>([]);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const stageInputRef = useRef<HTMLInputElement>(null);

  // Form fields
  const [companyName, setCompanyName] = useState("");
  const [companyBio, setCompanyBio] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [primaryContactName, setPrimaryContactName] = useState("");
  const [primaryContactEmail, setPrimaryContactEmail] = useState("");
  const [primaryContactPhone, setPrimaryContactPhone] = useState("");
  const [marketingContactName, setMarketingContactName] = useState("");
  const [marketingContactEmail, setMarketingContactEmail] = useState("");
  const [socialLinkedin, setSocialLinkedin] = useState("");
  const [socialFacebook, setSocialFacebook] = useState("");
  const [socialInstagram, setSocialInstagram] = useState("");
  const [socialTwitter, setSocialTwitter] = useState("");
  const [attendees, setAttendees] = useState<Attendee[]>([]);

  // Initialize attendee slots based on tier
  useEffect(() => {
    if (tierConfig) {
      setAttendees(
        Array.from({ length: tierConfig.passes }, () => ({ name: "", email: "" }))
      );
    }
  }, [tier]);

  // Load existing profile if returning
  useEffect(() => {
    const loadExisting = async () => {
      if (!sessionId) {
        setLoading(false);
        return;
      }
      try {
        const { data } = await supabase
          .rpc("get_partner_profile_by_session", { p_session_id: sessionId });

        if (data) {
          const p = data as any;
          setExistingId(p.id);
          setCompanyName(p.company_name || "");
          setCompanyBio(p.company_bio || "");
          setWebsiteUrl(p.website_url || "");
          setPrimaryContactName(p.primary_contact_name || "");
          setPrimaryContactEmail(p.primary_contact_email || "");
          setPrimaryContactPhone(p.primary_contact_phone || "");
          setMarketingContactName(p.marketing_contact_name || "");
          setMarketingContactEmail(p.marketing_contact_email || "");
          setSocialLinkedin(p.social_linkedin || "");
          setSocialFacebook(p.social_facebook || "");
          setSocialInstagram(p.social_instagram || "");
          setSocialTwitter(p.social_twitter || "");
          if (p.logo_url) setLogoPreview(p.logo_url);
          if (p.video_loop_url) setVideoLoopUrl(p.video_loop_url);
          if (p.stage_file_urls && Array.isArray(p.stage_file_urls)) {
            setStageFileUrls(p.stage_file_urls);
          }
          if (p.attendees && Array.isArray(p.attendees)) {
            const existing = p.attendees as Attendee[];
            const passes = tierConfig?.passes || existing.length;
            const padded = [
              ...existing,
              ...Array.from({ length: Math.max(0, passes - existing.length) }, () => ({
                name: "",
                email: "",
              })),
            ];
            setAttendees(padded);
          }
          if (p.onboarding_completed) setSubmitted(true);
        }
      } catch (err) {
        console.error("Error loading partner profile:", err);
      } finally {
        setLoading(false);
      }
    };
    loadExisting();
  }, [sessionId]);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an image under 5MB",
        variant: "destructive",
      });
      return;
    }
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const updateAttendee = (index: number, field: keyof Attendee, value: string) => {
    setAttendees((prev) =>
      prev.map((a, i) => (i === index ? { ...a, [field]: value } : a))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Upload logo if provided
      let logoUrl = logoPreview;
      if (logoFile) {
        const ext = logoFile.name.split(".").pop();
        const fileName = `${tier}-${Date.now()}.${ext}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("partner-logos")
          .upload(fileName, logoFile, { upsert: true });

        if (uploadError) {
          console.error("Logo upload error:", uploadError);
          toast({
            title: "Logo upload failed",
            description: "Your info will still be saved. You can re-upload later.",
            variant: "destructive",
          });
        } else {
          const { data: urlData } = supabase.storage
            .from("partner-logos")
            .getPublicUrl(uploadData.path);
          logoUrl = urlData.publicUrl;
        }
      }

      // Upload video loop if provided
      let finalVideoLoopUrl = videoLoopUrl;
      if (videoLoopFile) {
        const ext = videoLoopFile.name.split(".").pop();
        const fileName = `${tier}-video-loop-${Date.now()}.${ext}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("partner-files")
          .upload(fileName, videoLoopFile, { upsert: true });

        if (uploadError) {
          console.error("Video loop upload error:", uploadError);
          toast({
            title: "Video upload failed",
            description: "Your info will still be saved. You can re-upload later.",
            variant: "destructive",
          });
        } else {
          const { data: urlData } = supabase.storage
            .from("partner-files")
            .getPublicUrl(uploadData.path);
          finalVideoLoopUrl = urlData.publicUrl;
        }
      }

      // Upload stage files if provided (Platinum only)
      let finalStageFileUrls = [...stageFileUrls];
      if (stageFiles.length > 0) {
        for (const file of stageFiles) {
          const ext = file.name.split(".").pop();
          const fileName = `${tier}-stage-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from("partner-files")
            .upload(fileName, file, { upsert: true });

          if (uploadError) {
            console.error("Stage file upload error:", uploadError);
          } else {
            const { data: urlData } = supabase.storage
              .from("partner-files")
              .getPublicUrl(uploadData.path);
            finalStageFileUrls.push(urlData.publicUrl);
          }
        }
      }

      // Filter out empty attendee slots
      const filledAttendees = attendees.filter((a) => a.name.trim() || a.email.trim());

      const { error } = await supabase.rpc("save_partner_profile", {
        p_session_id: sessionId,
        p_tier: tier,
        p_company_name: companyName || null,
        p_company_bio: companyBio || null,
        p_website_url: websiteUrl || null,
        p_logo_url: logoUrl || null,
        p_video_loop_url: finalVideoLoopUrl || null,
        p_stage_file_urls: finalStageFileUrls.length > 0 ? finalStageFileUrls : null,
        p_primary_contact_name: primaryContactName || null,
        p_primary_contact_email: primaryContactEmail || null,
        p_primary_contact_phone: primaryContactPhone || null,
        p_marketing_contact_name: marketingContactName || null,
        p_marketing_contact_email: marketingContactEmail || null,
        p_social_linkedin: socialLinkedin || null,
        p_social_facebook: socialFacebook || null,
        p_social_instagram: socialInstagram || null,
        p_social_twitter: socialTwitter || null,
        p_attendees: filledAttendees as unknown as import("@/integrations/supabase/types").Json,
        p_onboarding_completed: true,
      });

      if (error) throw error;

      setSubmitted(true);
      toast({ title: "Profile saved!", description: "Welcome to the FORMULA family." });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      console.error("Error saving partner profile:", err);
      toast({
        title: "Error saving profile",
        description: "Please try again or contact us directly.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (!tierConfig) {
    return (
      <>

        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">Invalid Partner Tier</h1>
            <p className="text-muted-foreground">
              Please use the link provided in your confirmation email.
            </p>
          </div>
        </div>
      </>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your partner portal...</p>
        </div>
      </div>
    );
  }

  // Success state after submission
  if (submitted) {
    return (
      <>
        <SEO
          title={`Welcome, ${tierConfig.name} Partner | FORMULA 2026`}
          description="Your partner onboarding is complete"
          noindex
        />

        <div className="min-h-screen bg-background">
          <div className="container mx-auto px-4 py-12 max-w-2xl">
            <div className="text-center mb-10">
              <PartyPopper className="h-16 w-16 text-primary mx-auto mb-4" />
              <h1 className="text-4xl font-bold mb-3">You're All Set!</h1>
              <p className="text-lg text-muted-foreground">
                Thank you for completing your {tierConfig.name} Partner onboarding. Our team
                now has everything we need to start promoting your brand.
              </p>
            </div>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Rocket className="h-5 w-5 text-primary" />
                  What Happens Next
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="bg-primary/10 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-sm font-bold text-primary">1</span>
                  </div>
                  <div>
                    <p className="font-semibold">Podcast Interview</p>
                    <p className="text-sm text-muted-foreground">
                      We'll send you a scheduling link to record your 1-on-1 video
                      podcast interview. Keep an eye on your inbox.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-primary/10 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-sm font-bold text-primary">2</span>
                  </div>
                  <div>
                    <p className="font-semibold">Marketing & Promotions</p>
                    <p className="text-sm text-muted-foreground">
                      Your logo and branding will start appearing in our promotional
                      materials leading up to October 14th.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-primary/10 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-sm font-bold text-primary">3</span>
                  </div>
                  <div>
                    <p className="font-semibold">Lead List</p>
                    <p className="text-sm text-muted-foreground">
                      You'll receive your attendee lead list {tierConfig.leadListTiming}.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-primary/10 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-sm font-bold text-primary">4</span>
                  </div>
                  <div>
                    <p className="font-semibold">Mobile App</p>
                    <p className="text-sm text-muted-foreground">
                      Your company will get {tierConfig.appPlacement} in the FORMULA app.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild>
                <a href={IOS_APP_LINK} target="_blank" rel="noopener noreferrer">
                  <Smartphone className="w-4 h-4 mr-2" />
                  Download iOS App
                </a>
              </Button>
              <Button variant="outline" asChild>
                <a href={HOTEL_BOOK_URL} target="_blank" rel="noopener noreferrer">
                  Book Hotel Room
                </a>
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setSubmitted(false);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              >
                Edit My Info
              </Button>
            </div>

            <p className="text-center text-sm text-muted-foreground mt-8">
              Questions? Reach out to{" "}
              <a href="mailto:gregg@f3florida.com" className="text-primary hover:underline">
                gregg@f3florida.com
              </a>{" "}
              or{" "}
              <a href="mailto:justin@f3florida.com" className="text-primary hover:underline">
                justin@f3florida.com
              </a>
            </p>
          </div>
        </div>
      </>
    );
  }

  const TierIcon = tierConfig.icon;

  return (
    <>
      <SEO
        title={`Welcome, ${tierConfig.name} Partner | FORMULA 2026`}
        description="Complete your partner onboarding for FORMULA 2026"
        noindex
      />
      <div className="min-h-screen bg-background">
        {/* Hero */}
        <div className="bg-[#1a1a1a] border-b">
          {/* Accent bar */}
          <div className="flex h-1">
            <div className="flex-1 bg-[#f53214]" />
            <div className="flex-1 bg-[#fa9c27]" />
            <div className="flex-1 bg-[#48b4d1]" />
          </div>

          <div className="container mx-auto px-4 py-12 md:py-16 text-center">
            <div
              className={`${tierConfig.badgeColor} inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6`}
            >
              <TierIcon className="text-white" size={18} />
              <span className="text-white font-bold text-sm uppercase tracking-wider">
                {tierConfig.name} Partner
              </span>
            </div>

            <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
              Welcome to the FORMULA Family
            </h1>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto mb-6">
              We're fired up to have you on board as a {tierConfig.name} Partner.
              Let's get your brand dialed in so we can start promoting you to our
              community of growth-focused agency owners.
            </p>

            {/* Quick recap of what they get */}
            <div className="inline-flex flex-wrap justify-center gap-3 text-sm">
              <span className="bg-white/10 text-white px-3 py-1 rounded-full">
                {tierConfig.passes} Full-Access Passes
              </span>
              <span className="bg-white/10 text-white px-3 py-1 rounded-full">
                Podcast Interview
              </span>
              <span className="bg-white/10 text-white px-3 py-1 rounded-full">
                {tierConfig.appPlacement} in App
              </span>
              <span className="bg-white/10 text-white px-3 py-1 rounded-full">
                Photo/Video Package
              </span>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="container mx-auto px-4 py-10 max-w-3xl">
          <p className="text-center text-muted-foreground mb-8">
            Fill in as much as you can now — you can always come back to this page
            and update your info later.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Company Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-primary" />
                  Company Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="companyName">Company Name *</Label>
                  <Input
                    id="companyName"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Your company name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="companyBio">Company Bio / Description</Label>
                  <Textarea
                    id="companyBio"
                    value={companyBio}
                    onChange={(e) => setCompanyBio(e.target.value)}
                    placeholder="Tell us about your company — this will be used in marketing materials and the mobile app"
                    rows={4}
                  />
                </div>
                <div>
                  <Label htmlFor="websiteUrl">Website URL</Label>
                  <Input
                    id="websiteUrl"
                    type="url"
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    placeholder="https://yourcompany.com"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Logo Upload */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Image className="h-5 w-5 text-primary" />
                  Company Logo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Upload your logo for event materials, the mobile app, and
                  promotional content. PNG or SVG preferred, transparent or white
                  background.
                </p>
                <div
                  className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {logoPreview ? (
                    <div>
                      <img
                        src={logoPreview}
                        alt="Logo preview"
                        className="max-h-32 mx-auto mb-3 object-contain"
                      />
                      <p className="text-sm text-muted-foreground">
                        Click to replace
                      </p>
                    </div>
                  ) : (
                    <div>
                      <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                      <p className="font-medium">Click to upload your logo</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        PNG, SVG, or JPG — max 5MB
                      </p>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleLogoChange}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Video Loop Upload — All tiers */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MonitorPlay className="h-5 w-5 text-primary" />
                  30-Second Video Loop
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-2">
                  {tierConfig.hasGeneralSessionVideo
                    ? `Your ${tierConfig.name} partnership includes a 30-second silent video that plays on the General Session break screens AND the hallway/partnership-room screens.`
                    : `Your ${tierConfig.name} partnership includes a 30-second video loop that plays on the hallway and partnership-room screens.`}
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  Upload a <strong>30-second, no-audio video</strong> (MP4 preferred, max 100MB).
                  If you don't have one ready yet, no worries — you can come back and upload it later.
                </p>
                {videoLoopUrl && !videoLoopFile && (
                  <div className="mb-3 p-3 bg-muted/50 rounded-lg flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileVideo className="h-5 w-5 text-primary" />
                      <span className="text-sm">Video uploaded</span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setVideoLoopUrl(null)}
                    >
                      Replace
                    </Button>
                  </div>
                )}
                {videoLoopFile && (
                  <div className="mb-3 p-3 bg-muted/50 rounded-lg flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileVideo className="h-5 w-5 text-primary" />
                      <span className="text-sm truncate max-w-[200px]">{videoLoopFile.name}</span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setVideoLoopFile(null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                {!videoLoopFile && !videoLoopUrl && (
                  <div
                    className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
                    onClick={() => videoInputRef.current?.click()}
                  >
                    <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="font-medium">Click to upload your video loop</p>
                    <p className="text-sm text-muted-foreground mt-1">MP4, MOV — max 100MB, 30 seconds, no audio</p>
                  </div>
                )}
                <input
                  ref={videoInputRef}
                  type="file"
                  accept="video/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    if (file.size > 100 * 1024 * 1024) {
                      toast({ title: "File too large", description: "Max 100MB for video files", variant: "destructive" });
                      return;
                    }
                    setVideoLoopFile(file);
                  }}
                />
              </CardContent>
            </Card>

            {/* Stage Presentation Files — Platinum only */}
            {tierConfig.hasStageTime && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Presentation className="h-5 w-5 text-primary" />
                    Stage Presentation Files
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Your {tierConfig.name} partnership includes a <strong>5-minute live stage slot</strong> during
                    a General Session. Upload any files you'd like displayed on screen during your time —
                    slides, videos, images, etc. You can upload multiple files.
                  </p>
                  {stageFileUrls.length > 0 && (
                    <div className="space-y-2 mb-3">
                      {stageFileUrls.map((url, i) => (
                        <div key={i} className="p-2 bg-muted/50 rounded-lg flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <FileVideo className="h-4 w-4 text-primary" />
                            <span className="text-sm truncate max-w-[250px]">File {i + 1}</span>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setStageFileUrls((prev) => prev.filter((_, idx) => idx !== i))}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                  {stageFiles.length > 0 && (
                    <div className="space-y-2 mb-3">
                      {stageFiles.map((file, i) => (
                        <div key={i} className="p-2 bg-muted/50 rounded-lg flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <FileVideo className="h-4 w-4 text-primary" />
                            <span className="text-sm truncate max-w-[250px]">{file.name}</span>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setStageFiles((prev) => prev.filter((_, idx) => idx !== i))}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                  <div
                    className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
                    onClick={() => stageInputRef.current?.click()}
                  >
                    <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="font-medium">Click to upload presentation files</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Videos, slides, images — max 100MB each
                    </p>
                  </div>
                  <input
                    ref={stageInputRef}
                    type="file"
                    accept="video/*,image/*,.pdf,.pptx,.ppt,.key"
                    className="hidden"
                    multiple
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      const oversized = files.filter((f) => f.size > 100 * 1024 * 1024);
                      if (oversized.length > 0) {
                        toast({ title: "File too large", description: "Max 100MB per file", variant: "destructive" });
                        return;
                      }
                      setStageFiles((prev) => [...prev, ...files]);
                    }}
                  />
                </CardContent>
              </Card>
            )}

            {/* Primary Contact */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  Primary Contact
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="primaryName">Full Name *</Label>
                  <Input
                    id="primaryName"
                    value={primaryContactName}
                    onChange={(e) => setPrimaryContactName(e.target.value)}
                    placeholder="First and last name"
                    required
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="primaryEmail">Email *</Label>
                    <Input
                      id="primaryEmail"
                      type="email"
                      value={primaryContactEmail}
                      onChange={(e) => setPrimaryContactEmail(e.target.value)}
                      placeholder="you@company.com"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="primaryPhone">Phone</Label>
                    <Input
                      id="primaryPhone"
                      type="tel"
                      value={primaryContactPhone}
                      onChange={(e) => setPrimaryContactPhone(e.target.value)}
                      placeholder="(555) 123-4567"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Marketing Contact */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  Marketing Contact
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Who should we coordinate with for marketing materials, logo
                  approvals, and promotional content?
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="marketingName">Name</Label>
                    <Input
                      id="marketingName"
                      value={marketingContactName}
                      onChange={(e) => setMarketingContactName(e.target.value)}
                      placeholder="Full name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="marketingEmail">Email</Label>
                    <Input
                      id="marketingEmail"
                      type="email"
                      value={marketingContactEmail}
                      onChange={(e) => setMarketingContactEmail(e.target.value)}
                      placeholder="marketing@company.com"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Attendees */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Attendee Passes ({tierConfig.passes} Included)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Your {tierConfig.name} partnership includes{" "}
                  <strong>{tierConfig.passes} full-access passes</strong>. If you
                  know who's attending, add their info below. Don't worry if you
                  don't have all names yet — you can come back and update this
                  anytime.
                </p>
                <div className="space-y-3">
                  {attendees.map((attendee, i) => (
                    <div
                      key={i}
                      className="grid grid-cols-1 sm:grid-cols-[1fr_1fr] gap-3 p-3 bg-muted/50 rounded-lg"
                    >
                      <div>
                        <Label htmlFor={`att-name-${i}`} className="text-xs">
                          Pass {i + 1} — Name
                        </Label>
                        <Input
                          id={`att-name-${i}`}
                          value={attendee.name}
                          onChange={(e) =>
                            updateAttendee(i, "name", e.target.value)
                          }
                          placeholder="Full name"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`att-email-${i}`} className="text-xs">
                          Email
                        </Label>
                        <Input
                          id={`att-email-${i}`}
                          type="email"
                          value={attendee.email}
                          onChange={(e) =>
                            updateAttendee(i, "email", e.target.value)
                          }
                          placeholder="email@company.com"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Social Media */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Share2 className="h-5 w-5 text-primary" />
                  Social Media
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  We'll tag and promote your company across our channels leading up
                  to the event.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="linkedin">LinkedIn</Label>
                    <Input
                      id="linkedin"
                      value={socialLinkedin}
                      onChange={(e) => setSocialLinkedin(e.target.value)}
                      placeholder="https://linkedin.com/company/..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="facebook">Facebook</Label>
                    <Input
                      id="facebook"
                      value={socialFacebook}
                      onChange={(e) => setSocialFacebook(e.target.value)}
                      placeholder="https://facebook.com/..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="instagram">Instagram</Label>
                    <Input
                      id="instagram"
                      value={socialInstagram}
                      onChange={(e) => setSocialInstagram(e.target.value)}
                      placeholder="@yourcompany"
                    />
                  </div>
                  <div>
                    <Label htmlFor="twitter">X / Twitter</Label>
                    <Input
                      id="twitter"
                      value={socialTwitter}
                      onChange={(e) => setSocialTwitter(e.target.value)}
                      placeholder="@yourcompany"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* What's Coming Next */}
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Rocket className="h-5 w-5 text-primary" />
                  What's Coming Next
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <Mic className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">Podcast Interview</p>
                    <p className="text-sm text-muted-foreground">
                      We'll send you a scheduling link to record your 1-on-1
                      video podcast interview that gets promoted to our full email
                      list and social channels.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Smartphone className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">FORMULA Mobile App</p>
                    <p className="text-sm text-muted-foreground">
                      Your company will be featured with {tierConfig.appPlacement} in
                      the FORMULA app.{" "}
                      <a
                        href={IOS_APP_LINK}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        Download on iOS
                      </a>{" "}
                      — Android coming soon.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CalendarDays className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">Lead List</p>
                    <p className="text-sm text-muted-foreground">
                      You'll receive the attendee lead list{" "}
                      {tierConfig.leadListTiming}.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CalendarDays className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">Hotel Room Block</p>
                    <p className="text-sm text-muted-foreground">
                      Don't forget to{" "}
                      <a
                        href={HOTEL_BOOK_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        book your hotel room
                      </a>{" "}
                      at the JW Marriott Orlando Bonnet Creek. Group rates are
                      available but won't last forever.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Submit */}
            <div className="text-center pt-2 pb-12">
              <Button
                type="submit"
                variant="cta"
                size="lg"
                disabled={submitting}
                className="px-12 py-6 text-lg"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5 mr-2" />
                    {existingId ? "Update My Info" : "Submit Partner Info"}
                  </>
                )}
              </Button>
              <p className="text-sm text-muted-foreground mt-3">
                You can come back to this page anytime to update your information.
              </p>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default PartnerWelcome;

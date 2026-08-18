import ScrollToTop from "@/components/ScrollToTop";
import Hero from "@/components/Hero";
import Diagnosis from "@/components/Diagnosis";
import Pitch from "@/components/Pitch";
import SocialProof from "@/components/SocialProof";
import LeadForm from "@/components/LeadForm";
import StickyCta from "@/components/StickyCta";
import Footer from "@/components/Footer";

export default function Page() {
  return (
    <main>
      <ScrollToTop />
      <Hero />
      <Diagnosis />
      <Pitch />
      <SocialProof />
      <LeadForm />
      <StickyCta />
      <Footer />
    </main>
  );
}

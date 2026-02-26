
-- Create storage bucket for academy assets (logo for transcript/certificate)
INSERT INTO storage.buckets (id, name, public) VALUES ('academy-assets', 'academy-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access
CREATE POLICY "Academy assets are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'academy-assets');

-- Allow admins to upload
CREATE POLICY "Admins can upload academy assets"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'academy-assets' AND (SELECT has_role(auth.uid(), 'admin'::app_role)));

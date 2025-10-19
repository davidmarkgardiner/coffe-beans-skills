# Complete Workflow Guide

## ✅ What's Working

Great news! The video creation IS working. Here's what happens when you click "Create Video":

### Automatic Navigation Flow

```
1. Click "Create Video" in Ideas tab
   ↓
2. App switches to Create tab (🎬 Create)
   - Prompt is auto-filled from idea
   - Idea info box shows (green background)
   ↓
3. Click "Generate Video"
   ↓
4. App AUTOMATICALLY switches to Progress view
   - Shows real-time progress bar
   - Updates every 2 seconds
   - Shows percentage (0% → 100%)
   ↓
5. When complete, AUTOMATICALLY switches to Player
   - Video plays automatically
```

## 🎯 Where To See Video Progress

### The app has TWO ways to view videos:

**Option 1: Auto Progress View (Recommended)**
- After clicking "Generate Video"
- App automatically shows you the progress
- You DON'T need to click any tabs
- Just wait and watch the progress bar

**Option 2: Library Tab**
- Click "📚 Library" tab manually
- Shows ALL videos (completed + in progress)
- Filter by status:
  - "All" - shows everything
  - "Completed" - only finished videos
  - "In Progress" - only generating videos
  - "Failed" - only failed videos

## 📋 Step-by-Step: Complete Workflow

### Step 1: News (📰 Tab)
```
1. Click "🔄 Fetch Latest"
2. Browse articles
3. Click "✨ Generate Ideas" on an article
```

### Step 2: Ideas (✨ Tab)
```
1. Wait 10-15 seconds for AI to generate 5 ideas
2. Click "View Prompt" to read details
3. Click "✓ Approve" on best ideas
4. Click "🎬 Create Video" on approved idea
```

### Step 3: Create (🎬 Tab)
```
1. App auto-switches to Create tab
2. Verify:
   - Green box showing idea title
   - Prompt textarea is filled with AI text
   - Prompt is NOT empty
3. Optional: Change model/duration/resolution
4. Click "Generate Video"
```

### Step 4: Progress View (Automatic!)
```
1. App auto-switches to progress view
2. You see:
   - "Generating" or "Queued" header
   - Blue progress bar (0% → 100%)
   - Estimated time remaining
   - Video details (model, duration, resolution)
3. DO NOT click "Library" tab
4. Just wait (30-120 seconds depending on model)
```

### Step 5: Player (Automatic!)
```
1. When video hits 100%, app auto-switches to player
2. Video plays automatically
3. Review the video
4. Options:
   - Close (goes to Library)
   - Download
   - Create Remix
```

### Step 6: Library (📚 Tab)
```
1. Click "Library" tab
2. See ALL your videos
3. Use filters:
   - "All" - everything
   - "Completed" - finished videos
   - "In Progress" - currently generating
   - "Failed" - errors
4. Click "View" to watch
5. Click "📺 Publish" to upload to YouTube
```

### Step 7: Published (📺 Tab)
```
1. After publishing, click "Published" tab
2. See all YouTube videos
3. Click "Refresh Stats" for latest analytics
4. Click "View on youtube" to watch live
```

---

## ❓ Common Questions

### Q: I don't see the progress bar?
**A:** The app should auto-switch to the progress view. If it doesn't:
1. Check browser console (F12) for errors
2. Manually click the progress indicator (should be visible somewhere)
3. Or go to Library tab and filter by "In Progress"

### Q: Where is my video while it's generating?
**A:** The app automatically shows it in the progress view. You don't need to do anything - just wait. The view will update every 2 seconds.

### Q: Can I see multiple videos generating?
**A:** Yes! Go to Library tab and filter by "In Progress". But normally, the app will show you the most recent video automatically.

### Q: The prompt is empty in Create tab?
**A:**
1. Check browser console (F12) for debug logs
2. Should see: "App: handleGenerateVideo called with idea"
3. Should see: "VideoCreator: Auto-filling prompt with..."
4. If you see these logs but prompt is empty, let me know
5. If you don't see these logs, the prop isn't being passed

### Q: Video says "Failed"?
**A:**
1. Check the error message in the progress view
2. Common issues:
   - API key missing/invalid
   - Rate limit exceeded
   - Invalid prompt content
   - Model not available
3. Try again with a different model

---

## 🔍 Debugging Guide

### If you can't see progress:

**Check 1: Console Logs**
```
Press F12 → Console tab
Look for:
✅ "App: handleGenerateVideo called with idea"
✅ "VideoCreator: Idea prop changed"
✅ No red errors
```

**Check 2: Network Tab**
```
Press F12 → Network tab
After clicking "Generate Video":
✅ Should see POST to /api/v1/videos
✅ Status should be 200 or 201
✅ Response should have video ID
```

**Check 3: Backend Logs**
```bash
# In terminal, check backend logs
tail -f /tmp/content-gen-backend.log
# Should see video creation request
```

**Check 4: Video Files**
```bash
# Check if video file is being created
ls -lt /Users/davidgardiner/Desktop/repo/big-3-super-agent/apps/content-gen/backend/videos/
# Should see new files appearing
```

---

## 📊 Expected Timings

### Video Generation Times
- **Sora 2**: 30-60 seconds (fast, standard quality)
- **Sora 2 Pro**: 60-90 seconds (slow, high quality)
- **Veo 3.1**: 45-75 seconds (realistic)
- **Wan 2.5**: 45-75 seconds (lip-sync)

### Progress Updates
- Updates every 2 seconds
- Progress bar shows 0% → 100%
- May jump quickly at start, then slow down
- Final 10% can take longest

---

## 🎓 Pro Tips

### Tip 1: Don't Switch Tabs
- Let the app auto-navigate for you
- Switching tabs manually can be confusing
- Just click buttons and wait

### Tip 2: Use Library For Overview
- Want to see all videos? Go to Library
- Want to see what's generating? Filter "In Progress"
- Want to publish? Look for completed videos

### Tip 3: Check Console For Debugging
- Keep console open (F12)
- Watch for errors (red text)
- Debug logs show what's happening

### Tip 4: Refresh If Stuck
- If something seems wrong, refresh browser (Ctrl+Shift+R)
- Backend auto-reloads when code changes
- Frontend needs manual refresh

---

## ✅ Success Indicators

### You'll know it's working when:

**After Clicking "Generate Video":**
- [x] View automatically changes (not on Create tab anymore)
- [x] Progress bar appears
- [x] Progress percentage shows (0%, 5%, 10%...)
- [x] Bar is blue (in progress) or green (completed)

**During Generation:**
- [x] Progress updates every 2-3 seconds
- [x] Percentage increases: 0% → 10% → 25% → 50% → 75% → 100%
- [x] Estimated time shows

**When Complete:**
- [x] Progress hits 100%
- [x] View automatically switches to video player
- [x] Video plays automatically
- [x] No errors shown

---

## 🚨 If Nothing Is Happening

### Scenario: Clicked "Generate Video" but nothing happens

**Steps:**
1. Open browser console (F12)
2. Look for errors (red text)
3. Try clicking "Generate Video" again
4. Check console for POST request to /api/v1/videos
5. If you see error, copy it and share

### Scenario: Progress bar shows but stuck at 0%

**Steps:**
1. Wait at least 30 seconds (API can be slow to start)
2. Check backend logs: `tail -f /tmp/content-gen-backend.log`
3. Look for errors
4. If stuck >2 minutes, something is wrong

### Scenario: Progress completes but no video

**Steps:**
1. Go to Library tab
2. Look for the video
3. Check status: completed, failed, or in_progress?
4. If failed, click on it to see error message
5. If completed, click "View" to play

---

## 📞 Need Help?

### Information to provide:

1. **Which step fails?**
   - News → Ideas → Create → Generate → Progress → Player?

2. **Console errors?**
   - Press F12, copy any red error messages

3. **Network status?**
   - F12 → Network tab, check /api/v1/videos request

4. **Backend logs?**
   - Run: `tail -20 /tmp/content-gen-backend.log`

5. **What do you see?**
   - Describe what's on screen
   - Screenshot if possible

---

## 🎉 Success!

If you see:
- ✅ Progress bar updating
- ✅ Video generating
- ✅ Video completes and plays

**Congratulations! The entire workflow is working!**

Now you can:
1. Generate more videos from other ideas
2. Publish videos to YouTube
3. Track analytics in Published tab
4. Create variations with Remix

---

**Status:** Workflow working as designed
**Last Updated:** October 16, 2025
**Next:** Try the complete flow end-to-end!

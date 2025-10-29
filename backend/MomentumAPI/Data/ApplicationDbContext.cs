using Microsoft.EntityFrameworkCore;
using MomentumAPI.Models;

namespace MomentumAPI.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<ManualCheckin> ManualCheckins { get; set; }
        public DbSet<RawHealthData> RawHealthData { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // User configuration
            modelBuilder.Entity<User>(entity =>
            {
                entity.ToTable("users");
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => e.Email).IsUnique();
                entity.Property(e => e.Email).IsRequired();
                entity.Property(e => e.PasswordHash).IsRequired();
            });

            // ManualCheckin configuration
            modelBuilder.Entity<ManualCheckin>(entity =>
            {
                entity.ToTable("manual_checkins");
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => new { e.UserId, e.Date }).IsUnique();
                
                // Foreign key relationship
                entity.HasOne(m => m.User)
                    .WithMany(u => u.ManualCheckins)
                    .HasForeignKey(m => m.UserId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // RawHealthData configuration
            modelBuilder.Entity<RawHealthData>(entity =>
            {
                entity.ToTable("raw_health_data");
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => new { e.Date, e.Source });
            });
        }
    }
}
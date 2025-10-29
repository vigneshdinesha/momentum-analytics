using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MomentumAPI.Models
{
    [Table("raw_health_data")]
    public class RawHealthData
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Required]
        [MaxLength(50)]
        [Column("source")]
        public string Source { get; set; } = string.Empty;

        [Required]
        [MaxLength(50)]
        [Column("data_type")]
        public string DataType { get; set; } = string.Empty;

        [Required]
        [Column("date")]
        public DateOnly Date { get; set; }

        [Required]
        [Column("raw_json", TypeName = "jsonb")]
        public string RawJson { get; set; } = string.Empty;

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}